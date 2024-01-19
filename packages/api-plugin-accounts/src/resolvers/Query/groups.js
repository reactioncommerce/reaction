import getPaginatedResponse from "@reactioncommerce/api-utils/graphql/getPaginatedResponse.js";
import wasFieldRequested from "@reactioncommerce/api-utils/graphql/wasFieldRequested.js";
import isOpaqueId from "@reactioncommerce/api-utils/isOpaqueId.js";
import { decodeShopOpaqueId } from "../../xforms/id.js";

/**
 * Arguments passed by the client a groups query
 * @memberof Accounts/GraphQL
 * @typedef {ConnectionArgs} GroupConnectionArgs - An object of all arguments that were sent by the client
 * @property {ConnectionArgs} args - An object of all arguments that were sent by the client. {@link ConnectionArgs|See default connection arguments}
 * @property {String} args.shopId - The id of shop to filter groups by
 * @property {Number} args.sortBy - Sort results by a GroupSortByField enum value of `_id`, `name`, `createdAt`, or `updatedAt`
 */

/**
 * @name Query/groups
 * @method
 * @memberof Accounts/GraphQL
 * @summary Returns a list of account groups for a shop
 * @param {Object} _ - unused
 * @param {GroupConnectionArgs} args - an object of all arguments that were sent by the client. {@link ConnectionArgs|See default connection arguments}
 * @param {Object} context - an object containing the per-request state
 * @param {Object} info Info about the GraphQL request
 * @returns {Promise<Object[]>} an array of account Group objects
 */
export default async function groups(_, { shopId, ...connectionArgs }, context, info) {
  // Transform ID from base64
  const dbShopId = isOpaqueId(shopId) ? decodeShopOpaqueId(shopId) : shopId;

  const query = await context.queries.groups(context, dbShopId);
  return getPaginatedResponse(query, connectionArgs, {
    includeHasNextPage: wasFieldRequested("pageInfo.hasNextPage", info),
    includeHasPreviousPage: wasFieldRequested("pageInfo.hasPreviousPage", info),
    includeTotalCount: wasFieldRequested("totalCount", info)
  });
}
