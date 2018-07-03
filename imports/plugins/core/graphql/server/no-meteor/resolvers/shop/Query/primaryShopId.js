import { encodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";

/**
 * @name "Query.primaryShopId"
 * @method
 * @memberof Shop/GraphQL
 * @summary Gets the primary shop ID
 * @param {Object} parentObject - unused
 * @param {Object} args - unused
 * @param {Object} context - an object containing the per-request state
 * @return {Promise<String>} The shop ID based on the domain in ROOT_URL
 */
export default async function primaryShopId(_, __, context) {
  const shopId = await context.queries.accounts.primaryShopId(context.collections);
  return encodeShopOpaqueId(shopId);
}
