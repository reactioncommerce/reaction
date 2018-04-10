import { pipeP } from "ramda";
import { xformShopResponse } from "@reactioncommerce/reaction-graphql-xforms/shop";

/**
 * @name shop
 * @method
 * @summary gets the shop object for the provided account
 * @param {Object} account - result of the parent resolver, which is an Account object in GraphQL schema format
 * @param {Object} args - an object of all arguments that were sent by the client
 * @param {Object} context - an object containing the per-request state
 * @return {Object} The shop having ID account.shopId, in GraphQL schema format
 */
export default function shop(account, _, context) {
  const { shopId } = account;
  if (!shopId) return null;

  return pipeP(
    context.queries.shopById,
    xformShopResponse
  )(context, shopId);
}
