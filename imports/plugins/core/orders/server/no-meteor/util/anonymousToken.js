import hashToken from "@reactioncommerce/api-utils/hashToken.js";
import Random from "@reactioncommerce/random";

/**
 * Generate a new secret token for the purpose of controlled access to
 * anonymous-user-specific data.
 *
 * @returns {Object} token object with associated token properties
 * @returns {Date} token.createdAt creation date, could potentially be useful for implementing expiration, but these do not currently expire.
 * @returns {String} token.hashedToken used to locate this token in the database
 * @returns {String} token.token raw token for use in URLs, email, etc. Do not store in the DB.
 */
export function getAnonymousAccessToken() {
  const token = Random.secret();
  return {
    createdAt: new Date(),
    hashedToken: hashToken(token),
    token
  };
}

/**
 * Create a new anonymous access token and add it to an order
 *
 * @param {Object} context app context
 * @param {String} orderId order id
 *
 * @returns {String} raw token secret
 */
export async function addAnonymousOrderToken(context, orderId) {
  const token = getAnonymousAccessToken();
  // We must never store the raw secret in the DB
  // So that even if the DB data is compromised,
  // the raw secrets are not there
  const toStore = { ...token };
  delete toStore.token;
  const update = { $push: { anonymousAccessTokens: toStore } };
  await context.collections.Orders.updateOne({ _id: orderId }, update);
  return token.token;
}
