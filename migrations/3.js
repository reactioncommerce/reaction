/**
 * @summary Performs migration up from previous data version
 * @param {Object} context Migration context
 * @param {Object} context.db MongoDB `Db` instance
 * @param {Function} context.progress A function to report progress, takes percent
 *   number as argument.
 * @return {undefined}
 */
async function up({ db, progress }) {
  const affectedGroups = [
    "owner",
    "shop manager"
  ];

  const newShopPermissions = [
    "reaction:legacy:groups/create",
    "reaction:legacy:groups/delete",
    "reaction:legacy:groups/manage:accounts",
    "reaction:legacy:groups/read",
    "reaction:legacy:groups/update",
    "reaction:legacy:inventory/update:settings",
    "reaction:legacy:navigationTreeItems/update:settings",
    "reaction:legacy:navigationTrees/read:drafts",
    "reaction:legacy:shipping-rates/update:settings",
    "reaction:legacy:sitemaps/update:settings",
    "reaction:legacy:tags/read:invisible",
    "reaction:legacy:taxes/update:settings"
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
