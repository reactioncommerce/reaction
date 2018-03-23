import { xformShopResponse } from "@reactioncommerce/reaction-graphql-xforms/shop";

/**
 * @name shop
 * @method
 * @summary gets the shop object for the provided account
 * @param {Object} account - result of the parent resolver, which is an Account object in GraphQL schema format
 * @return {Object} The shop having ID account.shopId, in GraphQL schema format
 */
export default function shop(account) {
  const { shopId } = account;
  if (!shopId) return null;

  const result = {
    _id: shopId
  };

  return xformShopResponse(result);
}
