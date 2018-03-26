import { getPaginatedGroupResponse } from "@reactioncommerce/reaction-graphql-xforms/group";
import { decodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";

/**
 * @name groups
 * @method
 * @summary find and return the groups for a shop
 * @param {Object} resolverArgs - an object containing the result returned from the resolver
 * @param {String} resolverArgs._id - id of group to query
 * @param {Object} connectionArgs - an object of all arguments that were sent by the client
 * @param {String} connectionArgs.after - Connection argument
 * @param {String} connectionArgs.before - Connection argument
 * @param {Number} connectionArgs.first - Connection argument
 * @param {Number} connectionArgs.last - Connection argument
 * @param {Object} context - an object containing the per-request state
 * @return {Object[]} Promise that resolves with array of user Group objects
 */
export default async function groups({ _id }, connectionArgs, context) {
  // Transform ID from base64
  const dbShopId = decodeShopOpaqueId(_id);
  const query = await context.queries.groups(context, dbShopId);

  return await getPaginatedGroupResponse(query, connectionArgs);
}
