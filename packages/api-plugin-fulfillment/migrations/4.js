const affectedGlobalGroups = [
  "owner",
  "shop manager"
];

const newGlobalPermissions = [
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

  await db.collection("Groups").updateMany({
    slug: { $in: affectedGlobalGroups }
  }, {
    $pullAll: { permissions: newGlobalPermissions }
  });

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

  await db.collection("Groups").updateMany({
    slug: { $in: affectedGlobalGroups }
  }, {
    $addToSet: { permissions: { $each: newGlobalPermissions } }
  });

  progress(100);
}

export default {
  down,
  up
};
