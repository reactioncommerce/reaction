import getPaginatedResponse from "@reactioncommerce/api-utils/graphql/getPaginatedResponse.js";
import wasFieldRequested from "@reactioncommerce/api-utils/graphql/wasFieldRequested.js";
import { decodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";

/**
 * @name Query/navigationItemsByShopId
 * @method
 * @memberof Navigation/GraphQL
 * @summary Get a paginated list of navigation items for a shop, as an operator
 * @param {Object} _ unused
 * @param {ConnectionArgs} args An object of all arguments that were sent by the client
 * @param {String} args.shopId The ID of the shop to load navigation items for
 * @param {Object} context An object containing the per-request state
 * @param {Object} info Info about the GraphQL request
 * @returns {Promise<Object>} A NavigationItemConnection object
 */
export default async function navigationItemsByShopId(_, args, context, info) {
  const { shopId, ...connectionArgs } = args;
  const decodedShopId = decodeShopOpaqueId(shopId);

  const query = await context.queries.navigationItemsByShopId(context, decodedShopId);

  return getPaginatedResponse(query, connectionArgs, {
    includeHasNextPage: wasFieldRequested("pageInfo.hasNextPage", info),
    includeHasPreviousPage: wasFieldRequested("pageInfo.hasPreviousPage", info),
    includeTotalCount: wasFieldRequested("totalCount", info)
  });
}
