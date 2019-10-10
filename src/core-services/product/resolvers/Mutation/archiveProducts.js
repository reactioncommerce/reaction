import { decodeProductOpaqueId, decodeShopOpaqueId } from "../../xforms/id.js";

/**
*
* @method archiveProducts
* @summary Takes an array of product IDs and archives products
* @param {Object} _ - unused
* @param {Object} args - The input arguments
* @param {Object} args.input - mutation input object
* @param {String} args.input.productIds - an array of decoded product IDs to archive
* @param {String} args.input.shopId - shop these products belong to
* @param {Object} context - an object containing the per-request state
* @return {Array} array with archived products
*/
export default async function archiveProducts(_, { input }, context) {
  const {
    clientMutationId,
    productIds,
    shopId
  } = input;

  const decodedProductIds = productIds.map((productId) => decodeProductOpaqueId(productId));

  const archivedProducts = await context.mutations.archiveProducts(context, {
    productIds: decodedProductIds,
    shopId: decodeShopOpaqueId(shopId)
  });

  return {
    clientMutationId,
    products: archivedProducts
  };
}
