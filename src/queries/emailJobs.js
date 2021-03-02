/**
 * @name emailJobs
 * @method
 * @memberof Email
 * @summary query the Jobs collection and return email jobs
 * @param {Object} context - an object containing the per-request state
 * @param {String[]} shopIds - ids of the shops to get emails for
 * @returns {Object} group object
 */
export default async function emailJobs(context, shopIds) {
  const { collections } = context;
  const { Jobs } = collections;

  const validatePermissionsForShopIds = shopIds.map((shopId) => context.validatePermissions("reaction:legacy:emails", "read", { shopId }));

  await Promise.all(validatePermissionsForShopIds);

  return Jobs.find({
    "type": "sendEmail",
    "data.shopId": {
      $in: shopIds
    }
  });
}
