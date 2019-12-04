/**
 * @name discountCodes
 * @method
 * @memberof GraphQL/DiscountCodes
 * @summary Query the Discounts collection
 * @param {Object} context - an object containing the per-request state
 * @param {String} shopId - ID of Shop to query against
 * @returns {Promise<Object>} DiscountCodes object Promise
 */
export default async function discountCodes(context, shopId) {
  const { collections } = context;
  const { Discounts } = collections;

  await context.validatePermissionsLegacy(["admin", "owner"], null, { shopId });
  await context.validatePermissions("reaction:discounts", "read", { shopId });

  return Discounts.find({
    shopId
  });
}
