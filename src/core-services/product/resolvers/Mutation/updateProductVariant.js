import { decodeProductOpaqueId, decodeShopOpaqueId } from "../../xforms/id.js";

/**
 *
 * @method updateProductVariant
 * @summary Updates various product variant fields
 * @param {Object} _ - unused
 * @param {Object} args - The input arguments
 * @param {Object} args.input - mutation input object
 * @param {String} args.input.clientMutationId - The mutation id
 * @param {String} args.input.shopId - shopId of shop product belongs to
 * @param {Object} args.input.variant - updated variant fields
 * @param {String} args.input.variantId - Id of variant to update
 * @param {Object} context - an object containing the per-request state
 * @return {Promise<Object>} updateProductVariant payload
 */
export default async function updateProductVariant(_, { input }, context) {
  const {
    clientMutationId = null,
    shopId,
    variant,
    variantId
  } = input;

  const updatedVariant = await context.mutations.updateProductVariant(context, {
    variantId: decodeProductOpaqueId(variantId),
    shopId: decodeShopOpaqueId(shopId),
    variant
  });

  return {
    clientMutationId,
    variant: updatedVariant
  };
}
