import { curryN } from "ramda";

/**
 * @name shopsUserHasPermissionFor
 * @method
 * @memberof Accounts
 * @param {Object} user - The user object, with `roles` property, to check.
 * @param {String} permission - Permission to check for.
 * @return {Array} Shop IDs user has provided permissions for
 */
export function shopsUserHasPermissionFor(user, permission) {
  if (!user || !user.roles) return [];

  const { roles } = user;
  const shopIds = [];

  // `role` is a shopId, with an array of permissions attached to it.
  // Get the key of each shopId, and check if the permission exists on that key
  // If it does, then user has permission on this shop.
  Object.keys(roles).forEach((role) => {
    if (roles[role].includes(permission)) {
      shopIds.push(role);
    }
  });

  return shopIds;
}

export const getShopsUserHasPermissionForFunctionForUser = curryN(2, shopsUserHasPermissionFor);
