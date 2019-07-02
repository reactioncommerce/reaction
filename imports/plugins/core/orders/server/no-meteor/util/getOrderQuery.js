import ReactionError from "@reactioncommerce/reaction-error";
import hashLoginToken from "/imports/node-app/core/util/hashLoginToken";

export function getOrderQuery(context, selector, shopId, token) {
  const { accountId: contextAccountId, userHasPermission } = context;
  const newSelector = { ...selector, shopId };

  if (userHasPermission(["orders"], shopId)) {
    // admins with orders permissions can see any order in the shop
    // No need to adjust the selector
  } else if (contextAccountId) {
    // Regular users can only see their own orders
    newSelector.accountId = contextAccountId;
  } else if (token) {
    // If you have an anonymous access token for this order, OK to see it
    newSelector["anonymousAccessTokens.hashedToken"] = hashLoginToken(token);
  } else {
    throw new ReactionError("access-denied", "Access Denied");
  }
  return newSelector;
}
