import { createRequire } from "module";
import Logger from "@reactioncommerce/logger";
import ReactionError from "@reactioncommerce/reaction-error";

const require = createRequire(import.meta.url); // eslint-disable-line

const { curryN } = require("ramda");

const GLOBAL_GROUP = "__global_roles__";

/**
 * @name hasPermission
 * @param {Object} context App context
 * @param {Object} resource - resource user is trying to access
 * @param {Object} action - action user is trying to perform to be passed to in the GQL query
 * @param {Object} authContext - context data to verify permissions against
 * @param {String} [authContext.owner] - The owner of the resource requested
 * @param {String} [authContext.shopId] - The shop ID for which the permissions are needed. If not set,
 *   only global roles will be checked.
 * @param {Array} [authContext.legacyRoles] - TEMPORARY: roles that match up with the legacy roles package
 * @returns {Boolean} - true/false
 */
export default async function hasPermission(context, resource, action, authContext) {
  const { user } = context;

  // If the current user is the owner of a resource we are trying to check,
  // such as an order or data on a user profile, they are authorized to perform the action
  if (authContext && authContext.owner && authContext.owner === context.userId) return true;

  if (!user || !user.roles) return false;

  if (!resource) throw new ReactionError("invalid-param", "Resource must be provided");

  if (!action) throw new ReactionError("invalid-param", "Action must be provided");

  if (!authContext) throw new ReactionError("invalid-param", "authContext must be provided");

  const { legacyRoles: permissions, shopId: roleGroup } = authContext; // TODO(pod-auth): temporarily provide legacy roles

  if (!Array.isArray(permissions)) throw new ReactionError("invalid-param", "permissions must be an array of strings");
  if (roleGroup !== undefined && roleGroup !== null && (typeof roleGroup !== "string" || roleGroup.length === 0)) {
    throw new ReactionError("invalid-param", "roleGroup must be a non-empty string");
  }

  const checkRoles = permissions.slice(0);

  // This should always return true for owners
  if (!checkRoles.includes("owner")) checkRoles.push("owner");

  const { roles } = user;

  // always check GLOBAL_GROUP
  const globalRoles = roles[GLOBAL_GROUP];
  if (Array.isArray(globalRoles) && checkRoles.some((role) => globalRoles.includes(role))) return true;

  if (roleGroup) {
    // convert any periods to underscores for MongoDB compatibility
    const group = roleGroup.replace(/\./g, "_");

    const groupRoles = roles[group];

    if (Array.isArray(groupRoles) && checkRoles.some((role) => groupRoles.includes(role))) return true;
  }

  Logger.debug(`User ${user._id} has none of [${checkRoles.join(", ")}] permissions`);

  return false;
}

const hasPermissionCurried = curryN(2, hasPermission);
const hasPermissionCurried = curryN(4, hasPermission);

/**
 * @summary Get a `hasPermission` function bound to the current user context
 * @param {Object} context App context
 * @return {Function} hasPermission function for `context`
 */
export function getHasPermissionFunctionForUser(context) {
  return hasPermissionCurried(context);
}
