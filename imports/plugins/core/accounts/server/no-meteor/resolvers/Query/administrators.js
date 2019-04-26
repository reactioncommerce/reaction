import { getPaginatedResponse, wasFieldRequested } from "@reactioncommerce/reaction-graphql-utils";
import { decodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";

/**
 * @name "Query.administrators"
 * @method
 * @memberof Accounts/GraphQL
 * @summary find and return the administrators (users with "admin" or "owner" role) for a shop
 * @param {Object} _ - unused
 * @param {ConnectionArgs} args - an object of all arguments that were sent by the client
 * @param {Object} context - an object containing the per-request state
 * @param {Object} info Info about the GraphQL request
 * @return {Promise<Object[]>} Promise that resolves with array of user account objects
 */
export default async function administrators(_, { shopId, ...connectionArgs }, context, info) {
  // Transform ID from base64
  const dbShopId = decodeShopOpaqueId(shopId);

  const query = await context.queries.shopAdministrators(context, dbShopId);
  return getPaginatedResponse(query, connectionArgs, wasFieldRequested("totalCount", info));
}
