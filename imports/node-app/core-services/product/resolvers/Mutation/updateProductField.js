import { decodeProductOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/product";
import { decodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";

/**
 *
 * @method updateProductField
 * @summary updates a field on a product
 * @param {Object} _ - unused
 * @param {Object} args - The input arguments
 * @param {Object} args.input - mutation input object
 * @param {String} args.input.clientMutationId - The mutation id
 * @param {String} args.input.field - product field to update
 * @param {String} args.input.productId - productId of product to update
 * @param {String} args.input.shopId - shopId of shop product belongs to
 * @param {String} args.input.value - value to update field with
 * @param {Object} context - an object containing the per-request state
 * @return {Promise<Object>} updateProductField payload
 */
export default async function updateProductField(_, { input }, context) {
  const {
    clientMutationId = null,
    field,
    productId,
    shopId,
    value
  } = input;

  const updatedProduct = await context.mutations.updateProductField(context, {
    field,
    productId: decodeProductOpaqueId(productId),
    shopId: decodeShopOpaqueId(shopId),
    value
  });

  return {
    clientMutationId,
    product: updatedProduct
  };
}
