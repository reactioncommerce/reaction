import hashToken from "@reactioncommerce/api-utils/hashToken.js";
import ReactionError from "@reactioncommerce/reaction-error";

/**
 * @name getOrderQuery
 * @method
 * @memberof Order/helpers
 * @summary Creates Order mongo selector based on user permissions
 * @param {Object} context An object containing the per-request state
 * @param {Object} selector A mongo selector
 * @param {String} shopId Shop ID of the order
 * @param {String} token An anonymous order token, required if the order was placed without being logged in
 * @returns {Object} A mongo selector
 */
export function getOrderQuery(context, selector, shopId, token) {
  const { accountId: contextAccountId, userHasPermission } = context;
  const newSelector = { ...selector, shopId };

  if (userHasPermission(["orders", "order/fulfillment", "order/view"], shopId)) {
    // admins with orders permissions can see any order in the shop
    // admins with order/fulfillment and order/view permissions can also view order
    // with further permission checks in each component to limit functionality where needed
    // No need to adjust the selector to get the order
  } else if (contextAccountId) {
    // Regular users can only see their own orders
    newSelector.accountId = contextAccountId;
  } else if (token) {
    // If you have an anonymous access token for this order, OK to see it
    newSelector["anonymousAccessTokens.hashedToken"] = hashToken(token);
  } else {
    throw new ReactionError("access-denied", "Access Denied");
  }
  return newSelector;
}
