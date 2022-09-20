import { decodeProductOpaqueId } from "../../xforms/id.js";

/**
 *
 * @method publishProductsToCatalog
 * @summary Publish Products to the Catalog collection by Product ID
 * @param {Object} _ - unused
 * @param {Object} args - an object of all arguments that were sent by the previous resolver
 * @param {String[]} args.productIds - an array of Product IDs
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>} TODO: make sure this is the correct return type and this function needs to be async
 */
export default async function publishProductsToCatalog(_, args, context) {
  const { productIds } = args;
  const internalProductIds = productIds.map(decodeProductOpaqueId);
  return context.mutations.publishProducts(context, internalProductIds);
}
