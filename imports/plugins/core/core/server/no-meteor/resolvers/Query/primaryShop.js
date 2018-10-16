/**
 * @name "Query.primaryShop"
 * @method
 * @memberof Shop/GraphQL
 * @summary Gets the primary shop
 * @param {Object} parentObject - unused
 * @param {Object} args - unused
 * @param {Object} context - an object containing the per-request state
 * @return {Promise<o>} The shop, based on the domain in ROOT_URL
 */
export default async function primaryShopId(_, __, context) {
  const shopId = await context.queries.primaryShopId(context.collections);
  const shop = await context.queries.shopById(context, shopId);
  return shop;
}
