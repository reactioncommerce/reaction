import { createRequire } from "module";
import ReactionError from "@reactioncommerce/reaction-error";
import hasPermission from "./hasPermission.js";

const require = createRequire(import.meta.url); // eslint-disable-line

const { curryN } = require("ramda");

/**
 * @name checkPermissions
 * @method
 * @memberof Accounts
 * @param {Object} context - an object containing the per-request state
 * @param {String[]} permissions - Array of permission strings. The account must have at least one of them either globally or for the roleGroup.
 * @param {String} [roleGroup] - The shop ID for which the permissions are needed, or a more specific roles group. If not set,
 *   only global roles will be checked.
 * @returns {Undefined} Reaction error thrown if checks don't pass
 */
export default function checkPermissions(context, permissions, roleGroup) {
  const userHasPermission = hasPermission(context, permissions, roleGroup);

  if (!userHasPermission) {
    throw new ReactionError("access-denied", "Access Denied (being thrown from checkPermissions");
  }
}

const checkPermissionsCurried = curryN(2, checkPermissions);

/**
 * @summary Get a `checkPermissions` function bound to the current user context
 * @param {Object} context App context
 * @return {Function} checkPermissions function for `context.user`
 */
export function getCheckPermissionsFunctionForUser(context) {
  return checkPermissionsCurried(context);
}
