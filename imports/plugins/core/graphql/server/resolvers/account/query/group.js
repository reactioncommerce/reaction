import { pipe } from "ramda";
import { decodeGroupOpaqueId, xformGroupResponse } from "@reactioncommerce/reaction-graphql-xforms/group";

/**
 * @name group
 * @method
 * @summary query the Groups collection and return a group by id
 * @param {Object} _ - unused
 * @param {Object} args - an object of all arguments that were sent by the client
 * @param {String} args.id - id of group to query
 * @param {Object} context - an object containing the per-request state
 * @return {Object} group object
 */
export default function group(_, { id }, context) {
  // Transform ID from base64
  const dbGroupId = decodeGroupOpaqueId(id);

  return pipe(
    context.queries.group,
    xformGroupResponse
  )(context, dbGroupId);
}
