import { getPaginatedResponse } from "@reactioncommerce/reaction-graphql-utils";
import { xformArrayToConnection } from "@reactioncommerce/reaction-graphql-xforms/connection";

/**
 * Arguments passed by the client for a tags query
 * @memberof Tag/GraphQL
 * @typedef {ConnectionArgs} SubTagConnectionArgs - An object of all arguments that were sent by the client
 * @property {ConnectionArgs} args - An object of all arguments that were sent by the client. {@link ConnectionArgs|See default connection arguments}
 * @property {Boolean} args.shouldIncludeDeleted - If set to true, include deleted. Default false.
 * @property {Number} args.sortBy - Sort results by a TagSortByField enum value of `_id`, `name`, `position`, `createdAt`, `updatedAt`
 */

/**
 * @name "Tag.subTags"
 * @method
 * @memberof Tag/GraphQL
 * @summary Returns the child tags for a tag
 * @param {Object} tag - Tag response from parent resolver
 * @param {SubTagConnectionArgs} args - arguments sent by the client {@link ConnectionArgs|See default connection arguments}
 * @param {Object} context - an object containing the per-request state
 * @return {Promise<Object[]>} Promise that resolves with array of Tag objects
 */
export default async function subTags({ relatedTagIds }, connectionArgs, context) {
  if (!relatedTagIds || relatedTagIds.length === 0) return xformArrayToConnection(connectionArgs, []);

  const query = await context.queries.tagsByIds(context, relatedTagIds, connectionArgs);

  return getPaginatedResponse(query, connectionArgs);
}
