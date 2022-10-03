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
  const affectedGroups = [
    "owner",
    "shop manager"
  ];

  const newShopPermissions = [
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

  await db.collection("Groups").updateMany({
    slug: { $in: affectedGroups }
  }, {
    $addToSet: { permissions: { $each: newShopPermissions } }
  });

  progress(100);
}

export default {
  down: "impossible",
  up
};
