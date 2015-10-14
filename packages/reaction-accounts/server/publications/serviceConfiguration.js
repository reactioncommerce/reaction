/**
 * Publish ServiceConfiguration
 */
Meteor.publish("ServiceConfiguration", function (checkUserId) {
  check(checkUserId, Match.OneOf(String, null));
  let userId = checkUserId || this.userId;
  // Admins and account managers can manage the login methods for the shop
  if (Roles.userIsInRole(userId, ["owner", "admin", "dashboard/accounts"], ReactionCore.getShopId())) {
    return ServiceConfiguration.configurations.find({}, {
      fields: {
        secret: 1
      }
    });
  }

  return ServiceConfiguration.configurations.find({});
});
