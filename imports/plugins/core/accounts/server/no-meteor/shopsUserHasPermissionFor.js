/**
 * @name shopsUserHasPermissionFor
 * @method
 * @memberof Accounts
 * @param {Object} user - The user object, with `roles` property, to check.
 * @return {Array} Shop IDs user has any permissions for
 */
export default function shopsUserHasPermissionFor(user) {
  if (!user || !user.roles) return [];

  return Object.keys(user.roles);
}
