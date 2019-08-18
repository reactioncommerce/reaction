import { encodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";

/**
 * @name Query/primaryShopId
 * @method
 * @memberof Shop/GraphQL
 * @summary Gets the primary shop ID
 * @param {Object} _ - unused
 * @param {Object} __ - unused
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<String>} The shop ID based on the domain in ROOT_URL
 */
export default async function primaryShopId(_, __, context) {
  const shopId = await context.queries.primaryShopId(context.collections);
  return encodeShopOpaqueId(shopId);
}
