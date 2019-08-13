import { Roles } from "meteor/alanning:roles";

/**
 * setUserPermissions
 * @private
 * @summary Set user permissions
 * @param {Object} users -
 * @param {String} permissions -
 * @param {String} shopId -
 * @returns {null} -
 */
export default function setUserPermissions(users, permissions, shopId) {
  let affectedUsers = users;
  if (!Array.isArray(users)) {
    affectedUsers = [users];
  }

  return affectedUsers.forEach((user) => Roles.setUserRoles(user._id, permissions, shopId));
}
