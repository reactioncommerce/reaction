import { getPaginatedResponse, wasFieldRequested } from "@reactioncommerce/reaction-graphql-utils";
import { decodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";

/**
 * @name "Shop.roles"
 * @method
 * @memberof Shop/GraphQL
 * @summary find and return the roles for a shop
 * @param {Object} _ - unused
 * @param {Object} args - an object of all arguments that were sent by the client
 * @param {String} args.shopId - id of shop to query
 * @param {String} args.after - Connection argument
 * @param {String} args.before - Connection argument
 * @param {Number} args.first - Connection argument
 * @param {Number} args.last - Connection argument
 * @param {Object} context - an object containing the per-request state
 * @param {Object} info Info about the GraphQL request
 * @return {Promise<Object[]>} Promise that resolves with array of user Roles objects
 */
export default async function roles({ _id }, connectionArgs, context, info) {
  // Transform ID from base64
  const dbShopId = decodeShopOpaqueId(_id);

  const query = await context.queries.roles(context, dbShopId);

  return getPaginatedResponse(query, connectionArgs, wasFieldRequested("totalCount", info));
}
