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
 * @returns {Promise<Object>|undefined} A Cart object
 */
export default async function accountCartByAccountId(parentResult, args, context) {
  const { accountId, shopId } = args;

  return context.queries.accountCartByAccountId(context, {
    accountId: isOpaqueId(accountId) ? decodeAccountOpaqueId(accountId) : accountId,
    shopId: isOpaqueId(shopId) ? decodeShopOpaqueId(shopId) : shopId
  });
}
