import Logger from "@reactioncommerce/logger";
import ReactionError from "@reactioncommerce/reaction-error";

// Simple in-memory lock map to prevent concurrent account creation for the same user
// within a single Node.js process. This is intentionally minimal and can be replaced
// by a more advanced, distributed solution by swapping out the logic that calls
// `createAccount` (for example, via a custom context or plugin).
const accountCreationPromisesByUserId = new Map();

/**
 * @name ensureAccountForUser
 * @summary Ensure that an account exists for the given user ID, creating it if needed.
 *          Concurrent calls for the same user ID are coalesced so that only a single
 *          `createAccount` invocation happens per user at a time.
 * @param {Object} context - GraphQL request context
 * @param {String} userId - User ID for which to ensure an account exists
 * @returns {Object|null} Account document or null if it could not be created/found
 */
async function ensureAccountForUser(context, userId) {
  if (!userId || typeof context.auth?.accountByUserId !== "function") return null;

  // Fast path: if an account already exists, return it immediately
  const existingAccount = await context.auth.accountByUserId(context, userId);
  if (existingAccount) return existingAccount;

  // If we already have an in-flight creation for this user, await it instead of
  // starting another one.
  if (accountCreationPromisesByUserId.has(userId)) {
    return accountCreationPromisesByUserId.get(userId);
  }

  const creationPromise = (async () => {
    let account;
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
    } finally {
      // Ensure we do not hold onto stale promises indefinitely
      accountCreationPromisesByUserId.delete(userId);
    }

    return account || null;
  })();

  accountCreationPromisesByUserId.set(userId, creationPromise);
  return creationPromise;
}

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
    // Create an account the first time a user makes a request. Concurrent calls
    // for the same user will wait for the same in-flight creation rather than
    // attempting multiple inserts.
    account = await ensureAccountForUser(context, userId);
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
