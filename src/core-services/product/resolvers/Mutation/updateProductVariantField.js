import { decodeProductOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/product";
import { decodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";

/**
 *
 * @method updateProductVariantField
 * @summary updates a field on a product
 * @param {Object} _ - unused
 * @param {Object} args - The input arguments
 * @param {Object} args.input - mutation input object
 * @param {String} args.input.clientMutationId - The mutation id
 * @param {String} args.input.field - product field to update
 * @param {String} args.input.shopId - shopId of shop product belongs to
 * @param {String} args.input.value - value to update field with
 * @param {String} args.input.variantId - Id of variant to update
 * @param {Object} context - an object containing the per-request state
 * @return {Promise<Object>} updateProductVariantField payload
 */
export default async function updateProductVariantField(_, { input }, context) {
  const {
    clientMutationId = null,
    field,
    shopId,
    value,
    variantId
  } = input;

  // This `updateProductVariantField` resolver calls the `updateProductField` mutation
  // as we don't have the need to separate this into `updateProductVariantField` at this time.
  // In the future, we can create a `updateProductVariantField` mutation if needed.
  const updatedVariant = await context.mutations.updateProductField(context, {
    field,
    productId: decodeProductOpaqueId(variantId),
    shopId: decodeShopOpaqueId(shopId),
    value
  });

  return {
    clientMutationId,
    variant: updatedVariant
  };
}
