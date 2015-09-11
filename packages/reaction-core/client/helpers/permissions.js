
/**
* Methods for the reaction permissions
* https://github.com/ongoworks/reaction#rolespermissions-system
* use: {{hasPermissions admin userId}}
*/

/**
* registerHelper hasPermission
*/

Template.registerHelper("hasPermission", function(permissions, userId) {
  check(permissions, Match.OneOf(String, Object));
  if (typeof userId === 'object') {
    userId = Meteor.userId();
  }
  return ReactionCore.hasPermission(permissions, userId);
});

/**
* registerHelper hasOwnerAccess
*/

Template.registerHelper("hasOwnerAccess", function() {
  return ReactionCore.hasOwnerAccess();
});

/**
* registerHelper hasAdminAccess
*/

Template.registerHelper("hasAdminAccess", function() {
  return ReactionCore.hasAdminAccess();
});

/**
* registerHelper hasDashboardAccess
*/

Template.registerHelper("hasDashboardAccess", function() {
  return ReactionCore.hasDashboardAccess();
});

/**
* registerHelper allowGuestCheckout
*/

Template.registerHelper("allowGuestCheckout", function() {
  return ReactionCore.allowGuestCheckout();
});
