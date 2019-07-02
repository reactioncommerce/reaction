import _ from "lodash";

/**
 * @param {Object} order The order document to transform
 * @returns {Object} The converted order document
 */
export function toArray(order) {
  const tokens = order.anonymousAccessTokens || [];
  if (order.anonymousAccessToken) {
    tokens.push({ hashedToken: order.anonymousAccessToken, createdAt: new Date() });
    delete order.anonymousAccessToken;
  }
  order.anonymousAccessTokens = tokens;
  return order;
}

/**
 * @param {Object} order The order document to transform
 * @returns {Object} The converted order document
 */
export function fromArray(order) {
  const hashedToken = _.get(order, "anonymousAccessTokens[0].hashedToken");
  if (hashedToken) {
    order.anonymousAccessToken = hashedToken;
  }
  delete order.anonymousAccessTokens;
  return order;
}
