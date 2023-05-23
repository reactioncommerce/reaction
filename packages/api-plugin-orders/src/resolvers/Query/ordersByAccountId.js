import getPaginatedResponse from "@reactioncommerce/api-utils/graphql/getPaginatedResponse.js";
import wasFieldRequested from "@reactioncommerce/api-utils/graphql/wasFieldRequested.js";
import isOpaqueId from "@reactioncommerce/api-utils/isOpaqueId.js";
import { decodeAccountOpaqueId, decodeShopOpaqueId } from "../../xforms/id.js";

/**
 * @name Query/ordersByAccountId
 * @method
 * @memberof Order/GraphQL
 * @summary Get an order by its reference ID
 * @param {Object} parentResult - unused
 * @param {ConnectionArgs} args - An object of all arguments that were sent by the client
 * @param {String} args.accountId - accountId of owner of the orders
 * @param {String} args.orderStatus - workflow status to limit search results
 * @param {String} args.shopIds - shop IDs to check for orders from
 * @param {Object} context - An object containing the per-request state
 * @param {Object} info Info about the GraphQL request
 * @returns {Promise<Object>|undefined} An Order object
 */
export default async function ordersByAccountId(parentResult, args, context, info) {
  const { accountId, orderStatus, shopIds: opaqueShopIds, ...connectionArgs } = args;

  const shopIds = opaqueShopIds && opaqueShopIds.map((opaqueShopId) => (isOpaqueId(opaqueShopId) ? decodeShopOpaqueId(opaqueShopId) : opaqueShopId));

  const query = await context.queries.ordersByAccountId(context, {
    accountId: isOpaqueId(accountId) ? decodeAccountOpaqueId(accountId) : accountId,
    orderStatus,
    shopIds
  });

  return getPaginatedResponse(query, connectionArgs, {
    includeHasNextPage: wasFieldRequested("pageInfo.hasNextPage", info),
    includeHasPreviousPage: wasFieldRequested("pageInfo.hasPreviousPage", info),
    includeTotalCount: wasFieldRequested("totalCount", info)
  });
}
