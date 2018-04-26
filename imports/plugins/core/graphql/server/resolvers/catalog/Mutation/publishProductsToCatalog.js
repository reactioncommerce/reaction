import { decodeProductOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/product";

/**
 * TODO:
 * @method
 * @summary
 * @param
 * @since
 * @return
 */
export default async function publishProductsToCatalog(_, args, context) {
  const { productIds } = args;
  const internalProductIds = productIds.map(decodeProductOpaqueId);
  return context.mutations.publishProducts(internalProductIds);
}
