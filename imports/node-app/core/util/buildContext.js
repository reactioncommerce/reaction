/**
 * @name buildContext
 * @method
 * @memberof GraphQL
 * @summary Mutates the provided context object, adding `user`, `userId`, `shopId`, and
 *   `userHasPermission` properties.
 * @param {Object} context - A context object on which to set additional context properties
 * @param {Object} request - Request object
 * @param {Object} request.headers - Map of headers from the client request
 * @param {String} request.hostname - Hostname derived from Host or X-Forwarded-Host header
 * @param {String} request.protocol - Either http or https
 * @param {Object} [request.user] - The user who authenticated this request, if applicable
 * @returns {undefined} No return
 */
export default async function buildContext(context, request = {}) {
  // To support mocking the user in integration tests, we respect `context.user` if already set
  if (!context.user) {
    context.user = request.user || null;
  }

  const userId = (context.user && context.user._id) || null;
  context.userId = userId;

  let account;
  if (userId && typeof context.auth.accountByUserId === "function") {
    account = await context.auth.accountByUserId(context, userId);
  }

  context.account = account || null;
  context.accountId = (account && account._id) || null;

  // DEPRECATED. Client requests should include a shopId if one is needed.
  context.shopId = await context.queries.primaryShopId(context.collections);

  if (typeof context.auth.getHasPermissionFunctionForUser === "function") {
    context.userHasPermission = await context.auth.getHasPermissionFunctionForUser(context);
  }
  if (typeof context.auth.getShopsUserHasPermissionForFunctionForUser === "function") {
    context.shopsUserHasPermissionFor = await context.auth.getShopsUserHasPermissionForFunctionForUser(context);
  }

  // Make some request headers available to resolvers on context, but remove any
  // with potentially sensitive information in them.
  context.requestHeaders = { ...request.headers };
  delete context.requestHeaders.authorization;
  delete context.requestHeaders.cookie;
  delete context.requestHeaders["meteor-login-token"];

  // Reset isInternalCall in case it has been incorrectly changed
  context.isInternalCall = false;
}
