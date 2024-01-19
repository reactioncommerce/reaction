import isOpaqueId from "@reactioncommerce/api-utils/isOpaqueId.js";
import { decodeGroupOpaqueId } from "../../xforms/id.js";

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
  const dbGroupId = isOpaqueId(id) ? decodeGroupOpaqueId(id) : id;
  return context.queries.group(context, dbGroupId);
}
