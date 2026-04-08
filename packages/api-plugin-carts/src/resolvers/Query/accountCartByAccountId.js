import isOpaqueId from "@reactioncommerce/api-utils/isOpaqueId.js";
import { decodeAccountOpaqueId, decodeShopOpaqueId } from "../../xforms/id.js";

/**
 * @name Query/accountCartByAccountId
 * @method
 * @memberof Cart/GraphQL
 * @summary resolver for the accountCartByAccountId GraphQL mutation
 * @param {Object} parentResult - unused
 * @param {Object} args - an object of all arguments that were sent by the client
 * @param {String} args.accountId - The account for which to generate an account cart
 * @param {String} args.shopId - The shop that will own this cart
 * @param {Object} context - an object containing the per-request state
 * @param {Object} info - GraphQL resolver info
 * @returns {Promise<Object>|undefined} A Cart object
 */
export default async function accountCartByAccountId(parentResult, args, context, info) {
  const { accountId, shopId } = args;
  const decodedAccountId = isOpaqueId(accountId) ? decodeAccountOpaqueId(accountId) : accountId;
  const decodedShopId = isOpaqueId(shopId) ? decodeShopOpaqueId(shopId) : shopId;

  // Allow short-lived caching for frequent cart summary polling.
  info?.cacheControl?.setCacheHint({ maxAge: 60 });

  return context.queries.accountCartByAccountId(context, {
    accountId: decodedAccountId,
    shopId: decodedShopId
  });
}
