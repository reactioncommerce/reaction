import getPaginatedResponse from "@reactioncommerce/api-utils/graphql/getPaginatedResponse.js";
import wasFieldRequested from "@reactioncommerce/api-utils/graphql/wasFieldRequested.js";
import { decodeShopOpaqueId } from "../../xforms/id.js";

/**
 * @name Query/invitations
 * @method
 * @memberof Accounts/GraphQL
 * @summary query the Accounts collection and return a list of invitations
 * @param {Object} _ - unused
 * @param {Object} args - an object of all arguments that were sent by the client
 * @param {String} [args.shopIds] - Array of shop IDs
 * @param {Object} context - an object containing the per-request state
 * @param {Object} info Info about the GraphQL request
 * @returns {Promise<Object>} Promise containing queried invitations
 */
export default async function invitations(_, args, context, info) {
  const { shopIds: encodedShopIds, ...connectionArgs } = args;

  let shopIds;

  if (Array.isArray(encodedShopIds) && encodedShopIds.length > 0) {
    shopIds = encodedShopIds.map((shopId) => decodeShopOpaqueId(shopId));
  }

  const query = await context.queries.invitations(context, { shopIds });

  return getPaginatedResponse(query, connectionArgs, {
    includeHasNextPage: wasFieldRequested("pageInfo.hasNextPage", info),
    includeHasPreviousPage: wasFieldRequested("pageInfo.hasPreviousPage", info),
    includeTotalCount: wasFieldRequested("totalCount", info)
  });
}
