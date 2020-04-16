import getPaginatedResponse from "@reactioncommerce/api-utils/graphql/getPaginatedResponse.js";
import wasFieldRequested from "@reactioncommerce/api-utils/graphql/wasFieldRequested.js";
import { decodeShopOpaqueId, decodeTagOpaqueId } from "../../xforms/id.js";


/**
 * Arguments passed by the client for a tags query
 * @typedef {ConnectionArgs} TagConnectionArgs - An object of all arguments that were sent by the client
 * @memberof Tag/GraphQL
 * @property {ConnectionArgs} args - An object of all arguments that were sent by the client. {@link ConnectionArgs|See default connection arguments}
 * @property {Boolean} args.shouldIncludeDeleted - If set to true, include deleted. Default false.
 * @property {Boolean} ags.shouldIncludeInvisible - If set to true, include invisible. Default false.
 * @property {Boolean} args.isTopLevel - If set to a boolean, filter by this.
 * @property {String} args.shopId - The ID of shop to filter tags by
 * @property {Number} args.sortBy - Sort results by a TagSortByField enum value of `_id`, `name`, `position`, `createdAt`, `updatedAt`
 */

/**
 * @name Query/tags
 * @method
 * @memberof Tag/GraphQL
 * @summary Returns the tags for a shop
 * @param {Object} _ - unused
 * @param {TagConnectionArgs} connectionArgs - arguments sent by the client {@link ConnectionArgs|See default connection arguments}
 * @param {Object} context - an object containing the per-request state
 * @param {Object} info Info about the GraphQL request
 * @returns {Promise<Object[]>} Promise that resolves with array of Tag objects
 */
export default async function tags(_, connectionArgs, context, info) {
  const { shopId, excludedTagIds } = connectionArgs;

  const dbShopId = decodeShopOpaqueId(shopId);
  let dbExcludedTagIds;

  if (Array.isArray(excludedTagIds)) {
    dbExcludedTagIds = excludedTagIds.map(decodeTagOpaqueId);
  }

  const query = await context.queries.tags(context, dbShopId, {
    ...connectionArgs,
    excludedTagIds: dbExcludedTagIds
  });

  return getPaginatedResponse(query, connectionArgs, {
    includeHasNextPage: wasFieldRequested("pageInfo.hasNextPage", info),
    includeHasPreviousPage: wasFieldRequested("pageInfo.hasPreviousPage", info),
    includeTotalCount: wasFieldRequested("totalCount", info)
  });
}
