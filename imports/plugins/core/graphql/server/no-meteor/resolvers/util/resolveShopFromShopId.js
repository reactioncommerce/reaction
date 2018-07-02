/**
 * @name resolveShopFromShopId
 * @method
 * @memberof GraphQL/ResolverUtilities
 * @summary A generic resolver that gets the shop object for the provided parent result, assuming it has a `shopId` property
 * @param {Object} parent - result of the parent resolver
 * @param {Object} args - an object of all arguments that were sent by the client
 * @param {Object} context - an object containing the per-request state
 * @return {Promise<Object>} The shop having ID parent.shopId, in GraphQL schema format
 */
export default async function resolveShopFromShopId(parent, _, context) {
  const { shopId } = parent;
  if (!shopId) return null;

  return context.queries.shops.shopById(context, shopId);
}
