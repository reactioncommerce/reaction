/*
 * Methods for the reaction permissions
 * https://github.com/ongoworks/reaction#rolespermissions-system
 * use: {{hasPermissions admin userId}}
 */

/**
 * hasPermission template helper
 * @summary check current user hasPermission
 * @param  {String|Array} "permissions"
 * @param  {String} checkUserId - optional Meteor.userId, default to current
 * @return {Boolean}
 */
Template.registerHelper("hasPermission", function (permissions, checkUserId) {
  check(permissions, Match.OneOf(String, Object));
  let userId;
  if (typeof checkUserId === "object") {
    userId = checkUserId;
  } else {
    userId = Meteor.userId();
  }
  return ReactionCore.hasPermission(permissions, userId);
});

/**
 * hasOwnerAccess template helper
 * @summary check if user has owner access
 * @return {Boolean} return true if owner
 */
Template.registerHelper("hasOwnerAccess", function () {
  return ReactionCore.hasOwnerAccess();
});

/**
 * hasAdminAccess template helper
 * @summary check if user has admin access
 * @return {Boolean} return true if admin
 */
Template.registerHelper("hasAdminAccess", function () {
  return ReactionCore.hasAdminAccess();
});

/**
 * hasDashboardAccess template helper
 * @summary check if user has dashboard access
 * @return {Boolean} return true if user has dashboard permission
 */
Template.registerHelper("hasDashboardAccess", function () {
  return ReactionCore.hasDashboardAccess();
});

/**
 * allowGuestCheckout template helper
 * @summary check if guest users are allowed to checkout
 * @return {Boolean} return true if shop has guest checkout enabled
 */
Template.registerHelper("allowGuestCheckout", function () {
  return ReactionCore.allowGuestCheckout();
});
