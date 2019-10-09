import Random from "@reactioncommerce/random";
import hashToken from "./hashToken.js";

/**
 * Generate a new secret token for the purpose of controlled access to
 * anonymous-user-specific data.
 *
 * @returns {Object} token object with associated token properties
 * @returns {Date} token.createdAt creation date, could potentially be useful for implementing expiration, but these do not currently expire.
 * @returns {String} token.hashedToken used to locate this token in the database
 * @returns {String} token.token raw token for use in URLs, email, etc. Do not store in the DB.
 */
export default function getAnonymousAccessToken() {
  const token = Random.secret();
  return {
    createdAt: new Date(),
    hashedToken: hashToken(token),
    token
  };
}
