import getAccounts from "./accountServer.js";
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
 * @returns {Object} The user associated with the token
 */
async function getUserFromAuthToken(loginToken) {
  const { accountsServer } = await getAccounts();
  const authToken = loginToken.replace(/bearer\s/gi, "");
  const user = await accountsServer.resumeSession(authToken);
  return user;
}

export default getUserFromAuthToken;
