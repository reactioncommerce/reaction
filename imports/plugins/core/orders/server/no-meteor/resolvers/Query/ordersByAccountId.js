import { getPaginatedResponse } from "@reactioncommerce/reaction-graphql-utils";
import { decodeAccountOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/account";
import { decodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";

/**
 * @name Query.ordersByAccountId
 * @method
 * @memberof Order/GraphQL
 * @summary Get an order by its reference ID
 * @param {Object} parentResult - unused
 * @param {ConnectionArgs} args - An object of all arguments that were sent by the client
 * @param {String} args.accountId - accountId of owner of the orders
 * @param {String} args.shopIds - shop IDs to check for orders from
 * @param {Object} context - An object containing the per-request state
 * @return {Promise<Object>|undefined} An Order object
 */
export default async function ordersByAccountId(parentResult, args, context) {
  const { accountId, shopIds: opaqueShopIds, ...connectionArgs } = args;

  const shopIds = opaqueShopIds && opaqueShopIds.map(decodeShopOpaqueId);

  const query = await context.queries.ordersByAccountId(context, {
    accountId: decodeAccountOpaqueId(accountId),
    shopIds
  });

  return getPaginatedResponse(query, connectionArgs);
}
