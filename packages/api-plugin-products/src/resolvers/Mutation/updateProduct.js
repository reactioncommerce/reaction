import isOpaqueId from "@reactioncommerce/api-utils/isOpaqueId.js";
import { decodeProductOpaqueId, decodeShopOpaqueId, decodeTagOpaqueId } from "../../xforms/id.js";

/**
 *
 * @method updateProduct
 * @summary Updates various product fields
 * @param {Object} _ - unused
 * @param {Object} args - The input arguments
 * @param {Object} args.input - mutation input object
 * @param {String} args.input.clientMutationId - The mutation id
 * @param {String} args.input.product - product fields to update
 * @param {String} args.input.productId - productId of product to update
 * @param {String} args.input.shopId - shopId of shop product belongs to
 * @param {Object} context - an object containing the per-request state
 * @return {Promise<Object>} updateProduct payload
 */
export default async function updateProduct(_, { input }, context) {
  const {
    clientMutationId = null,
    product: productInput,
    productId,
    shopId
  } = input;

  if (Array.isArray(productInput.tagIds)) {
    productInput.hashtags = productInput.tagIds.map((tagId) => (isOpaqueId(tagId) ? decodeTagOpaqueId(tagId) : tagId));
    delete productInput.tagIds;
  }

  const updatedProduct = await context.mutations.updateProduct(context, {
    product: productInput,
    productId: isOpaqueId(productId) ? decodeProductOpaqueId(productId) : productId,
    shopId: isOpaqueId(shopId) ? decodeShopOpaqueId(shopId) : shopId
  });

  return {
    clientMutationId,
    product: updatedProduct
  };
}
