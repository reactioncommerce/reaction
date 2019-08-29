import { decodeGroupOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/group";

/**
 * @name Query/group
 * @method
 * @memberof Accounts/GraphQL
 * @summary query the Groups collection and return a group by id
 * @param {Object} _ - unused
 * @param {Object} args - an object of all arguments that were sent by the client
 * @param {String} args.id - id of group to query
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>} group object
 */
export default async function group(_, { id }, context) {
  const dbGroupId = decodeGroupOpaqueId(id);
  return context.queries.group(context, dbGroupId);
}
