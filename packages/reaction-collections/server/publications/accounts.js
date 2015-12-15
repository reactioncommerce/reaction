/**
 * accounts
 */

const Accounts = ReactionCore.Collections.Accounts;

Meteor.publish("Accounts", function (userId) {
  check(userId, Match.OneOf(String, null));
  // global admin can get all accounts
  if (Roles.userIsInRole(this.userId, ["owner"], Roles.GLOBAL_GROUP)) {
    return Accounts.find();
    // shop admin gets accouns for just this shop
  } else if (Roles.userIsInRole(this.userId, ["admin", "owner"], ReactionCore.getShopId(this))) {
    return Accounts.find({
      shopId: ReactionCore.getShopId(this)
    });
    // regular users should get just their account
  }
  return ReactionCore.Collections.Accounts.find({
    userId: this.userId
  });
});

/**
 * userProfile
 * get any user name,social profile image
 * should be limited, secure information
 * users with permissions  ["dashboard/orders", "owner", "admin", "dashboard/customers"]
 * may view the profileUserId"s profile data.
 *
 * @params {String} profileUserId -  view this users profile when permitted
 */

Meteor.publish("UserProfile", function (profileUserId) {
  check(profileUserId, Match.OneOf(String, null));
  const permissions = ["dashboard/orders", "owner", "admin", "dashboard/customers"];

  if (profileUserId !== this.userId && Roles.userIsInRole(this.userId, permissions, ReactionCore.getCurrentShop(
      this)._id || Roles.userIsInRole(this.userId, permissions, Roles.GLOBAL_GROUP))) {
    return Meteor.users.find({
      _id: profileUserId
    }, {
      fields: {
        "emails": true,
        "profile.firstName": true,
        "profile.lastName": true,
        "profile.familyName": true,
        "profile.secondName": true,
        "profile.name": true,
        "services.twitter.profile_image_url_https": true,
        "services.facebook.id": true,
        "services.google.picture": true,
        "services.github.username": true,
        "services.instagram.profile_picture": true
      }
    });
  } else if (this.userId) {
    return Meteor.users.find({
      _id: this.userId
    });
  }
  return [];
});
