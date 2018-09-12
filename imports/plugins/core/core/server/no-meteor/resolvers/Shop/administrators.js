import { getPaginatedResponse } from "@reactioncommerce/reaction-graphql-utils";
import { decodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";

/**
 * @name "Shop.administrators"
 * @method
 * @memberof Shop/GraphQL
 * @summary find and return the administrators (users with "admin" or "owner" role) for a shop
 * @param {Object} shop - The shop object returned by the parent resolver
 * @param {ConnectionArgs} args - an object of all arguments that were sent by the client
 * @param {Object} context - an object containing the per-request state
 * @return {Promise<Object[]>} Promise that resolves with array of user account objects
 */
export default async function administrators(shop, connectionArgs, context) {
  // Transform ID from base64
  const dbShopId = decodeShopOpaqueId(shop._id);

  const query = await context.queries.shopAdministrators(context, dbShopId);
  return getPaginatedResponse(query, connectionArgs);
}
