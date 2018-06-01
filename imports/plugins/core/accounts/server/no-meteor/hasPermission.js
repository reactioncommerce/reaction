const GLOBAL_GROUP = "__global_roles__";

/**
 * @name hasPermission
 * @method
 * @memberof Accounts
 * @param {Object} user - The user object, with `roles` property, to check.
 * @param {String[]} permissions - Array of permission strings. The account must have at least one of them either globally or for the roleGroup.
 * @param {String} [roleGroup] - The shop ID for which the permissions are needed, or a more specific roles group. If not set,
 *   only global roles will be checked.
 * @return {Boolean} True if the account with ID accountId has at least one of the requested permissions in the roleGroup group
 */
export default function hasPermission(user, permissions, roleGroup) {
  if (!user || !user.roles) return false;

  if (!Array.isArray(permissions)) throw new Error("permissions must be an array of strings");
  if (roleGroup !== undefined && roleGroup !== null && (typeof roleGroup !== "string" || roleGroup.length === 0)) {
    throw new Error("roleGroup must be a non-empty string");
  }

  const checkRoles = permissions.slice(0);

  // This should always return true for owners
  if (checkRoles.indexOf("owner") === -1) checkRoles.push("owner");

  const { roles } = user;

  // always check GLOBAL_GROUP
  const globalRoles = roles[GLOBAL_GROUP];
  if (Array.isArray(globalRoles) && checkRoles.some((role) => globalRoles.indexOf(role) !== -1)) return true;

  if (roleGroup) {
    // convert any periods to underscores for MongoDB compatibility
    const group = roleGroup.replace(/\./g, "_");

    const groupRoles = roles[group];
    if (Array.isArray(groupRoles) && checkRoles.some((role) => groupRoles.indexOf(role) !== -1)) return true;
  }

  return false;
}
