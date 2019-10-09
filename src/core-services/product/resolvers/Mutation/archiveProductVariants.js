import { decodeProductOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/product";
import { decodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";

/**
*
* @method archiveProductVariants
* @summary Takes an array of variant IDs and archives variants
* @param {Object} _ - unused
* @param {Object} args - The input arguments
* @param {Object} args.input - mutation input object
* @param {String} args.input.shopId - shop these variants belong to
* @param {String} args.input.variantIds - an array of variant IDs to archive
* @param {Object} context - an object containing the per-request state
* @return {Array} array with archived variants
*/
export default async function archiveProductVariants(_, { input }, context) {
  const {
    clientMutationId,
    shopId,
    variantIds
  } = input;

  const decodedVariantIds = variantIds.map((variantId) => decodeProductOpaqueId(variantId));

  // This `archiveProductVariants` resolver calls the `archiveProducts` mutation
  // as we don't have the need to separate this into `archiveProductVariants` at this time.
  // In the future, we can create a `archiveProductVariants` mutation if needed.
  const archivedVariants = await context.mutations.archiveProducts(context, {
    productIds: decodedVariantIds,
    shopId: decodeShopOpaqueId(shopId)
  });

  return {
    clientMutationId,
    variants: archivedVariants
  };
}
