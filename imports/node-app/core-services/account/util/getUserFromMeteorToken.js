import hashToken from "@reactioncommerce/api-utils/hashToken.js";
import ReactionError from "@reactioncommerce/reaction-error";
import tokenExpiration from "./tokenExpiration.js";

/**
 * Given a login token and the current context, returns the user document
 * for that token, using the same lookup logic that Meteor's accounts packages use.
 *
 * If the provided token is not associated with any user or is associated but is
 * expired, this function throws an "access-denied" ReactionError.
 *
 * @name getUserFromMeteorToken
 * @method
 * @memberof GraphQL
 * @summary Looks up a user by token
 * @param {String} loginToken An object with request-specific state
 * @param {Object} context An object with request-specific state
 * @returns {Function} The error formatter function
 */
async function getUserFromMeteorToken(loginToken, context) {
  const { collections } = context;
  const { users } = collections;

  const hashedToken = hashToken(loginToken);

  // search for user from the database with hashedToken
  // note: no need for a fiber aware findOne
  const currentUser = await users.findOne({
    "services.resume.loginTokens.hashedToken": hashedToken
  });

  if (!currentUser) throw new ReactionError("access-denied", "Token invalid");

  // find the right login token because the user may have
  // several sessions logged in on different browsers/computers
  const tokenInformation = currentUser.services.resume.loginTokens.find((tokenInfo) => tokenInfo.hashedToken === hashedToken);

  // get token expiration date
  const expiresAt = tokenExpiration(tokenInformation.when);

  const isExpired = expiresAt < new Date();
  if (isExpired) throw new ReactionError("access-denied", "Token expired");

  return currentUser;
}

export default getUserFromMeteorToken;
