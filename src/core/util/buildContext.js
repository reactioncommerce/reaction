/**
 * @name buildContext
 * @method
 * @memberof GraphQL
 * @summary Mutates the provided context object, adding `user`, `userId`, `account`,
 *   `accountId`, `userHasPermission`, and `requestHeaders` properties.
 * @param {Object} context - A context object on which to set additional context properties
 * @param {Object} request - Request object
 * @param {Object} request.headers - Map of headers from the client request
 * @param {String} request.hostname - Hostname derived from Host or X-Forwarded-Host header
 * @param {String} request.protocol - Either http or https
 * @returns {undefined} No return
 */
export default async function buildContext(context, request = {}) {
  // To support mocking the user in integration tests, we respect `context.user` if already set
  if (!context.user && typeof context.getUserByAuthToken === "function") {
    const user = await context.getUserByAuthToken(context, request.headers.authorization);
    context.user = user || null;
  }

  const userId = (context.user && context.user._id) || null;
  context.userId = userId;

  let account;
  if (userId && typeof context.getAccountByUserId === "function") {
    account = await context.getAccountByUserId(context, userId);
  }

  context.account = account || null;
  context.accountId = (account && account._id) || null;

  if (userId && typeof context.getUserHasPermissionFunction === "function") {
    context.userHasPermission = await context.getUserHasPermissionFunction(context);
  }

  // Make some request headers available to resolvers on context, but remove any
  // with potentially sensitive information in them.
  context.requestHeaders = { ...request.headers };
  delete context.requestHeaders.authorization;
  delete context.requestHeaders.cookie;

  // Reset isInternalCall in case it has been incorrectly changed
  context.isInternalCall = false;
}
