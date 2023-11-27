const COLL_FF_SOURCE = "Shipping";
const COLL_FF_DEST = "Fulfillment";
const COLL_FFR_SOURCE = "FlatRateFulfillmentRestrictions";
const COLL_FFR_DEST = "FulfillmentRestrictions";
const FF_TYPE = "shipping";
const FF_METHOD = "flatRate";
const COLL_DEST = "Fulfillment";

const newGlobalPermissions = [
  "reaction:legacy:fulfillmentTypes/update:settings",
  "reaction:legacy:fulfillmentRestrictions/create",
  "reaction:legacy:fulfillmentRestrictions/delete",
  "reaction:legacy:fulfillmentRestrictions/read",
  "reaction:legacy:fulfillmentRestrictions/update",
  "reaction:legacy:fulfillmentTypes/create",
  "reaction:legacy:fulfillmentTypes/delete",
  "reaction:legacy:fulfillmentTypes/read",
  "reaction:legacy:fulfillmentTypes/update",
  "reaction:legacy:fulfillmentMethods/create",
  "reaction:legacy:fulfillmentMethods/delete",
  "reaction:legacy:fulfillmentMethods/read",
  "reaction:legacy:fulfillmentMethods/update"
];

/**
 * @summary migrates the database down one version
 * @param {Object} context Migration context
 * @param {Object} context.db MongoDB `Db` instance
 * @param {Function} context.progress A function to report progress, takes percent
 *   number as argument.
 * @return {undefined}
 */
async function down({ db, progress }) {
  progress(0);

  const allGroups = await db.collection("Groups").find({}).toArray();
  const affectedGlobalGroups = [];
  allGroups.forEach((group) => {
    const perms = group.permissions;
    if (perms && Array.isArray(perms) && perms.length) {
      const found = newGlobalPermissions.some((elem) => perms.includes(elem));
      if (found) affectedGlobalGroups.push(group.slug);
    }
  });

  await db.collection("Groups").updateMany({
    slug: { $in: affectedGlobalGroups }
  }, {
    $pullAll: { permissions: newGlobalPermissions }
  });
  progress(10);

  await db.collection(COLL_FF_DEST).drop();
  progress(50);

  await db.collection(COLL_FFR_DEST).drop();
  progress(100);
}

/**
 * @summary Performs migration up from previous data version
 * @param {Object} context Migration context
 * @param {Object} context.db MongoDB `Db` instance
 * @param {Function} context.progress A function to report progress, takes percent
 *   number as argument.
 * @return {undefined}
 */
async function up({ db, progress }) {
  progress(0);

  const shippingCopyResp = await db.collection(COLL_FF_SOURCE).aggregate([{ $match: {} }, { $out: COLL_FF_DEST }]).next();
  if (shippingCopyResp) throw new Error("Error in copying Shipping collection"); // above command returns null if successful
  progress(20);

  const flatRateRestCopyResp = await db.collection(COLL_FFR_SOURCE).aggregate([{ $match: {} }, { $out: COLL_FFR_DEST }]).next();
  if (flatRateRestCopyResp) throw new Error("Error in copying FlatRateFulfillmentRestrictions collection"); // above command returns null if successful
  progress(40);

  const operations = [];

  const ffTypeUpdate = {
    updateMany: {
      filter: { fulfillmentType: { $exists: false } },
      update: {
        $set: {
          fulfillmentType: FF_TYPE
        }
      }
    }
  };

  const ffMethodUpdate = {
    updateMany: {
      filter: { methods: { $exists: true } },
      update: {
        $set: {
          "methods.$[eachMethod].fulfillmentMethod": FF_METHOD
        }
      },
      arrayFilters: [
        {
          "eachMethod.fulfillmentMethod": { $exists: false }
        }
      ]
    }
  };

  operations.push(ffTypeUpdate);
  operations.push(ffMethodUpdate);

  const bulkWriteResp = await db.collection(COLL_DEST).bulkWrite(operations);
  if (bulkWriteResp.writeErrors && bulkWriteResp.writeErrors.length) throw new Error("Error while updating Fulfillment collection");
  progress(50);

  const oldPerms = [
    "reaction:legacy:shippingMethods/create",
    "reaction:legacy:shippingMethods/delete",
    "reaction:legacy:shippingMethods/read",
    "reaction:legacy:shippingMethods/update",
    "reaction:legacy:shippingRestrictions/create",
    "reaction:legacy:shippingRestrictions/delete",
    "reaction:legacy:shippingRestrictions/read",
    "reaction:legacy:shippingRestrictions/update"
  ];

  const mapperSetFFMethodsRestricts = {
    "reaction:legacy:shippingMethods/create": "reaction:legacy:fulfillmentMethods/create",
    "reaction:legacy:shippingMethods/delete": "reaction:legacy:fulfillmentMethods/delete",
    "reaction:legacy:shippingMethods/read": "reaction:legacy:fulfillmentMethods/read",
    "reaction:legacy:shippingMethods/update": "reaction:legacy:fulfillmentMethods/update",
    "reaction:legacy:shippingRestrictions/create": "reaction:legacy:fulfillmentRestrictions/create",
    "reaction:legacy:shippingRestrictions/delete": "reaction:legacy:fulfillmentRestrictions/delete",
    "reaction:legacy:shippingRestrictions/read": "reaction:legacy:fulfillmentRestrictions/read",
    "reaction:legacy:shippingRestrictions/update": "reaction:legacy:fulfillmentRestrictions/update"
  };
  const mapperSetFFTypes = {
    "reaction:legacy:shippingMethods/create": "reaction:legacy:fulfillmentTypes/create",
    "reaction:legacy:shippingMethods/delete": "reaction:legacy:fulfillmentTypes/delete",
    "reaction:legacy:shippingMethods/read": "reaction:legacy:fulfillmentTypes/read",
    "reaction:legacy:shippingMethods/update": "reaction:legacy:fulfillmentTypes/update"
  };
  const allGroups = await db.collection("Groups").find({}).toArray();

  for (let index = 0; index < allGroups.length; index += 1) {
    const currentGroup = allGroups[index];
    const currentPerms = currentGroup.permissions;
    const permsToAdd = [];

    if (currentPerms && Array.isArray(currentPerms) && currentPerms.length) {
      oldPerms.forEach((oldPerm) => {
        if (currentPerms.includes(oldPerm)) {
          permsToAdd.push(mapperSetFFMethodsRestricts[oldPerm]);
          if (mapperSetFFTypes[oldPerm]) {
            permsToAdd.push(mapperSetFFTypes[oldPerm]);
          }
        }
      });
    }
    if (permsToAdd.length) {
      permsToAdd.push("reaction:legacy:fulfillmentTypes/update:settings"); // add this setting to groups deailing with ff-types
      // eslint-disable-next-line no-await-in-loop
      await db.collection("Groups").updateOne(
        { _id: currentGroup._id },
        {
          $addToSet: { permissions: { $each: permsToAdd } }
        }
      );
    }
  }

  progress(100);
}

export default {
  down,
  up
};
