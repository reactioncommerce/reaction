import crypto from "crypto";

/**
 * @summary This is Meteor's Accounts._hashLoginToken
 * @param {String} token A token
 * @returns {String} Hashed token string
 */
export default function hashToken(token) {
  const hash = crypto.createHash("sha256");
  hash.update(token);
  return hash.digest("base64");
}
