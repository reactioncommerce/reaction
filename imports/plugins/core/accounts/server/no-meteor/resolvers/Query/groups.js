import { getPaginatedResponse } from "@reactioncommerce/reaction-graphql-utils";
import { decodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";

/**
 * Arguments passed by the client a groups query
 * @memberof Accounts/GraphQL
 * @typedef {ConnectionArgs} GroupConnectionArgs - An object of all arguments that were sent by the client
 * @property {ConnectionArgs} args - An object of all arguments that were sent by the client. {@link ConnectionArgs|See default connection arguments}
 * @property {String} args.shopId - The id of shop to filter groups by
 * @property {Number} args.sortBy - Sort results by a GroupSortByField enum value of `_id`, `name`, `createdAt`, or `updatedAt`
 */

/**
 * @name "Query.groups"
 * @method
 * @memberof Accounts/GraphQL
 * @summary find and return the administrators (users with "admin" or "owner" role) for a shop
 * @param {Object} _ - unused
 * @param {GroupConnectionArgs} args - an object of all arguments that were sent by the client. {@link ConnectionArgs|See default connection arguments}
 * @param {Object} context - an object containing the per-request state
 * @return {Promise<Object[]>} an array of user Group objects
 */
export default async function groups(_, { shopId, ...connectionArgs }, context) {
  // Transform ID from base64
  const dbShopId = decodeShopOpaqueId(shopId);

  const query = await context.queries.groups(context, dbShopId);
  return getPaginatedResponse(query, connectionArgs);
}
