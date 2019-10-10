import { decodeProductOpaqueId, decodeShopOpaqueId } from "../../xforms/id.js";

/**
 *
 * @method cloneProducts
 * @summary Takes an array of product IDs and clones products
 * @param {Object} _ - unused
 * @param {Object} args - The input arguments
 * @param {Object} args.input - mutation input object
 * @param {String} args.input.clientMutationId - The mutation id
 * @param {String[]} args.input.productIds - an array of product IDs to clone
 * @param {Object} context - an object containing the per-request state
 * @return {Promise<Object>} cloneProducts payload
 */
export default async function cloneProducts(_, { input }, context) {
  const {
    clientMutationId,
    productIds,
    shopId
  } = input;

  const decodedProductIds = productIds.map((productId) => decodeProductOpaqueId(productId));

  const clonedProducts = await context.mutations.cloneProducts(context, {
    productIds: decodedProductIds,
    shopId: decodeShopOpaqueId(shopId)
  });

  return {
    clientMutationId,
    products: clonedProducts
  };
}
