/**
 * accounts
 */

const Accounts = ReactionCore.Collections.Accounts;

Meteor.publish("Accounts", function (userId) {
  check(userId, Match.OneOf(String, null));
  // we could additionally make checks of useId defined, but this could lead to
  // situation when user will may not have time to get an account
  if (this.userId === null) {
    return this.ready();
  }
  // global admin can get all accounts
  if (Roles.userIsInRole(this.userId, ["owner"], Roles.GLOBAL_GROUP)) {
    return Accounts.find();
    // shop admin gets accounts for just this shop
  } else if (Roles.userIsInRole(this.userId, ["admin", "owner"],
      ReactionCore.getShopId())) {
    return Accounts.find({
      shopId: ReactionCore.getShopId()
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
 * users with permissions  ["dashboard/orders", "owner", "admin", "dashboard/
 * customers"] may view the profileUserId"s profile data.
 *
 * @params {String} profileUserId -  view this users profile when permitted
 */

Meteor.publish("UserProfile", function (profileUserId) {
  check(profileUserId, Match.OneOf(String, null));
  if (this.userId === null) {
    return this.ready();
  }
  const permissions = ["dashboard/orders", "owner", "admin",
    "dashboard/customers"];
  // TODO: this part currently not working as expected.
  // we could have three situation here:
  // 1 - registered user log in.
  // 2 - admin log in
  // 3 - admin want to get user data
  // I'm not sure about the 3rd case, but we do not cover 2nd case here, because
  // we can see a situation when anonymous user still represented by
  // `profileUserId`, but admin user already could be found by `this.userId`
  // In that case what we should do here?
  if (profileUserId !== this.userId && Roles.userIsInRole(this.userId,
    permissions, ReactionCore.getCurrentShop()._id ||
    Roles.userIsInRole(this.userId, permissions, Roles.GLOBAL_GROUP))) {
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
  }

  return Meteor.users.find({
    _id: this.userId
  });
});
