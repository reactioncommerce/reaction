import Logger from "@reactioncommerce/logger";
import ReactionError from "@reactioncommerce/reaction-error";

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
  if (!context.user) {
    context.user = request.user || null;
  }

  const userId = (context.user && context.user._id) || null;
  context.userId = userId;

  // authorization methods
  if (userId) {
    if (context.getFunctionsOfType("getHasPermissionFunctionForUser") && context.getFunctionsOfType("getHasPermissionFunctionForUser").length) {
      context.userHasPermission = async (...args) => {
        // get all functions of type getHasPermissionFunctionForUser
        const allAuthPluginFunctions = await context.getFunctionsOfType("getHasPermissionFunctionForUser");

        const allPermissions = await Promise.all(allAuthPluginFunctions.map(async (func) => {
          // call with context for currying
          const result = await func(context)(...args);
          return result;
        }));

        // userHasPermission if ALL permission checks are `true`
        return allPermissions.every((permission) => permission === true);
      };
    } else {
      Logger.debug("No functions of type 'getHasPermissionFunctionForUser' found");
      context.userHasPermission = () => false;
    }

    context.validatePermissions = async (...args) => {
      const allowed = await context.userHasPermission(...args);
      if (!allowed) throw new ReactionError("access-denied", "Access Denied");
    };
  } else {
    context.validatePermissions = async () => {
      Logger.debug("Access denied due to no authenticated user");
      throw new ReactionError("access-denied", "Access Denied");
    };
    context.userHasPermission = () => false;
  }
  // /authorization methods

  let account;
  let permissions;
  if (userId && typeof context.auth.accountByUserId === "function") {
    account = await context.auth.accountByUserId(context, userId);

    // Create an account the first time a user makes a request
    if (!account) {
      try {
        Logger.debug(`Creating missing account for user ID ${userId}`);
        account = await context.mutations.createAccount(context.getInternalContext(), {
          emails: context.user.emails && context.user.emails.map((rec) => ({ ...rec, provides: rec.provides || "default" })),
          name: context.user.name,
          profile: context.user.profile || {},
          userId
        });
      } catch (error) {
        // We might have had a unique index error if account already exists due to timing
        account = await context.auth.accountByUserId(context, userId);
        if (!account) Logger.error(error, "Creating missing account failed");
      }
    }
    if (typeof context.auth.permissionsByUserId === "function") {
      permissions = await context.auth.permissionsByUserId(context, userId);
    }
  }

  context.account = account || null;
  context.accountId = (account && account._id) || null;
  context.userPermissions = permissions || [];

  // Make some request headers available to resolvers on context, but remove any
  // with potentially sensitive information in them.
  context.requestHeaders = { ...request.headers };
  delete context.requestHeaders.authorization;
  delete context.requestHeaders.cookie;
  delete context.requestHeaders["meteor-login-token"];
}
