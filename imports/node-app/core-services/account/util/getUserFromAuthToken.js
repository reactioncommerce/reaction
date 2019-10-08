import Logger from "@reactioncommerce/logger";
import ReactionError from "@reactioncommerce/reaction-error";
import expandAuthToken from "./expandAuthToken.js";

/**
 * Given an Authorization Bearer token and the current context, returns the user document
 * for that token after performing token checks.
 *
 * If the provided token is not associated with any user or is associated but is
 * expired, this function throws an "access-denied" ReactionError.
 *
 * @name getUserFromAuthToken
 * @method
 * @memberof GraphQL
 * @summary Looks up a user by token
 * @param {String} loginToken Auth token
 * @param {Object} context An object with request-specific state
 * @returns {Object} The user associated with the token
 */
async function getUserFromAuthToken(loginToken, context) {
  const token = loginToken.replace(/bearer\s/gi, "");

  const tokenObj = await expandAuthToken(token);

  if (tokenObj && !tokenObj.active) {
    Logger.error("Bearer token is not active");
    throw new ReactionError("access-denied", "Token invalid or expired");
  } else if (tokenObj && tokenObj.token_type && tokenObj.token_type !== "access_token") {
    Logger.error("Bearer token is not an access token");
    throw new ReactionError("access-denied", "Token is not an access token");
  }

  const _id = tokenObj.sub;
  const { collections } = context;
  const { users } = collections;

  const currentUser = await users.findOne({ _id });

  if (!currentUser) throw new ReactionError("access-denied", "Token invalid");

  return currentUser;
}

export default getUserFromAuthToken;
