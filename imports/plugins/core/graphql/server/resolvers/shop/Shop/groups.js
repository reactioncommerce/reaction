import { getPaginatedGroupResponse } from "@reactioncommerce/reaction-graphql-xforms/group";

/**
 * @name groups
 * @method
 * @summary find and return the groups for an aaccount
 * @param {String} args._id - id of group to query
 * @param {Object} args - an object of all arguments that were sent by the client
 * @param {String} args.after - Connection argument
 * @param {String} args.before - Connection argument
 * @param {Number} args.first - Connection argument
 * @param {Number} args.last - Connection argument
 * @param {Object} context - an object containing the per-request state
 * @return {Object[]} Promise that resolves with array of user Group objects
 */
export default async function groups({ _id }, connectionArgs, context) {
  const query = await context.queries.groups(context, _id);
  return await getPaginatedGroupResponse(query, connectionArgs);
}
