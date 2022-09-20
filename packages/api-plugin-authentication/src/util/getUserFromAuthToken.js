import getAccounts from "./accountServer.js";
import hasTokenExpired from "./hasTokenExpired.js";

/**
 * Given an Authorization Bearer token and the current context, returns the user document
 * for that token after performing token checks.
 *
 * If the provided token is not associated with any user, this function throws an
 * "access-denied" ReactionError.
 * If the provided token has expired, the function skips the user lookup and proceeds
 * as if no token has been provided in the request
 *
 * @name getUserFromAuthToken
 * @method
 * @memberof GraphQL
 * @summary Looks up a user by token
 * @param {String} loginToken Auth token
 * @returns {Object} The user associated with the token
 */
async function getUserFromAuthToken(loginToken) {
  const { accountsServer } = await getAccounts();
  const authToken = loginToken.replace(/bearer\s/gi, "");

  if (hasTokenExpired(authToken)) return null;

  return accountsServer.resumeSession(authToken);
}

export default getUserFromAuthToken;
