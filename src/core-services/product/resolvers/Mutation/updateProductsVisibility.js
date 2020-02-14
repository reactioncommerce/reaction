import { decodeProductOpaqueId, decodeShopOpaqueId } from "../../xforms/id.js";

/**
*
* @method updateProductsVisibility
* @summary Takes an array of product IDs and sets their visibility property
* @param {Object} _ - unused
* @param {Object} args - The input arguments
* @param {Object} args.input - mutation input object
* @param {Array<String>} args.input.productIds - an array of decoded product IDs to archive
* @param {String} args.input.shopId - shop these products belong to
* @param {String} args.input.isVisible - the desired product visibility
* @param {Object} context - an object containing the per-request state
* @return {Object} Includes a success boolean prop indicating whether the operation was successful or not
*/
export default async function updateProductsVisibility(_, { input }, context) {
  const {
    clientMutationId,
    productIds,
    shopId,
    isVisible
  } = input;

  const decodedProductIds = productIds.map((productId) => decodeProductOpaqueId(productId));

  const result = await context.mutations.updateProductsVisibility(context, {
    productIds: decodedProductIds,
    shopId: decodeShopOpaqueId(shopId),
    isVisible
  });

  return {
    clientMutationId,
    success: result
  };
}
