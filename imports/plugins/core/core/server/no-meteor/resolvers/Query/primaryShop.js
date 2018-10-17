/**
 * @name "Query.primaryShop"
 * @method
 * @memberof Shop/GraphQL
 * @summary Gets the primary shop
 * @param {Object} parentObject - unused
 * @param {Object} args - unused
 * @param {Object} context - an object containing the per-request state
 * @return {Promise<Object>} The shop, based on the domain in ROOT_URL
 */
export default async function primaryShop(_, __, context) {
  const shop = await context.queries.primaryShop(context);
  return shop;
}
