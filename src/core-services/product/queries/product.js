/**
 * @name product
 * @method
 * @memberof GraphQL/Product
 * @summary Query the Products collection for a single product
 * @param {Object} context - an object containing the per-request state
 * @param {Object} input - Request input
 * @param {String} input.productId - Product ID
 * @param {String} input.shopId - Shop ID
 * @returns {Promise<Object>} Product object Promise
 */
export default async function product(context, input) {
  const { checkPermissions, collections } = context;
  const { Products } = collections;
  const { productId, shopId } = input;

  checkPermissions(["owner", "admin", "createProduct"], shopId);

  return Products.findOne({
    _id: productId,
    shopId
  });
}
