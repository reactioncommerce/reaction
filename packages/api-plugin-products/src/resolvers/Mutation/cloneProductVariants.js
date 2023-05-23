import isOpaqueId from "@reactioncommerce/api-utils/isOpaqueId.js";
import { decodeProductOpaqueId, decodeShopOpaqueId } from "../../xforms/id.js";

/**
 *
 * @method cloneProductVariants
 * @summary Takes an array of product variant IDs and clones variants
 * @param {Object} _ - unused
 * @param {Object} args - The input arguments
 * @param {Object} args.input - mutation input object
 * @param {String} args.input.clientMutationId - The mutation id
 * @param {String[]} args.input.variantIds - an array of variant IDs to clone
 * @param {Object} context - an object containing the per-request state
 * @return {Promise<Object>} cloneProductVariants payload
 */
export default async function cloneProductVariants(_, { input }, context) {
  const {
    clientMutationId,
    shopId,
    variantIds
  } = input;

  const decodedVariantIds = variantIds.map((variantId) => (isOpaqueId(variantId) ? decodeProductOpaqueId(variantId) : variantId));

  const clonedVariants = await context.mutations.cloneProductVariants(context, {
    shopId: isOpaqueId(shopId) ? decodeShopOpaqueId(shopId) : shopId,
    variantIds: decodedVariantIds
  });

  return {
    clientMutationId,
    variants: clonedVariants
  };
}
