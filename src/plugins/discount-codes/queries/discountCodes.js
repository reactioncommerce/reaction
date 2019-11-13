/**
 * @name discountCodes
 * @method
 * @memberof GraphQL/DiscountCodes
 * @summary Query the DiscountCodes collection
 * @param {Object} context - an object containing the per-request state
 * @param {String} shopId - ID of Shop to query against
 * @returns {Promise<Object>} DiscountCodes object Promise
 */
export default async function discountCodes(context, shopId) {
  const { checkPermissions, collections } = context;
  const { DiscountCodes } = collections;

  await checkPermissions(["owner", "admin"], shopId);

  return DiscountCodes.find({
    shopId
  });
}
