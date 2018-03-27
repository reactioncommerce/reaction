import { getPaginatedRolesResponse } from "@reactioncommerce/reaction-graphql-xforms/roles";
import { decodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";

/**
 * @name roles
 * @method
 * @summary find and return the roles for a shop
 * @param {Object} _ - unused
 * @param {Object} args - an object of all arguments that were sent by the client
 * @param {String} args.shopId - id of shop to query
 * @param {String} args.after - Connection argument
 * @param {String} args.before - Connection argument
 * @param {Number} args.first - Connection argument
 * @param {Number} args.last - Connection argument
 * @param {Object} context - an object containing the per-request state
 * @return {Object[]} Promise that resolves with array of user Roles objects
 */
export default async function roles(_, { shopId, ...connectionArgs }, context) {
  // Transform ID from base64
  const dbShopId = decodeShopOpaqueId(shopId);

  const query = await context.queries.roles(context, dbShopId);

  return await getPaginatedRolesResponse(query, connectionArgs);
}
