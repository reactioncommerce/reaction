import ReactionError from "@reactioncommerce/reaction-error";
import hashLoginToken from "/imports/node-app/core/util/hashLoginToken";

/**
 * @name getOrderQuery
 * @method
 * @memberof Order/helpers
 * @summary Creates Order mongo selector based on user permissions
 * @param {Object} context An object containing the per-request state
 * @param {Object} selector A mongo selector
 * @param {String} shopId Shop ID of the order
 * @param {String} token An anonymous order token, required if the order was placed without being logged in
 * @return {Object} A mongo selector
 */
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
