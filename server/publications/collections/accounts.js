import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Roles } from "meteor/alanning:roles";
import * as Collections from "/lib/collections";
import { Reaction } from "/server/api";

/**
 * accounts
 */

Meteor.publish("Accounts", function (userId) {
  check(userId, Match.OneOf(String, null));
  // we could additionally make checks of useId defined, but this could lead to
  // situation when user will may not have time to get an account
  if (this.userId === null) {
    return this.ready();
  }

  const shopId = Reaction.getShopId();
  if (!shopId) {
    return this.ready();
  }

  const nonAdminGroups = Collections.Groups.find({
    name: { $in: ["guest"] },
    shopId
  }, {
    fields: { _id: 1 }
  }).fetch().map((group) => group._id);

  // global admin can get all accounts
  if (Roles.userIsInRole(this.userId, ["owner"], Roles.GLOBAL_GROUP)) {
    return Collections.Accounts.find({
      groups: { $nin: nonAdminGroups }
    });

  // shop admin gets accounts for just this shop
  } else if (Roles.userIsInRole(this.userId, ["admin", "owner", "reaction-accounts"], shopId)) {
    return Collections.Accounts.find({
      groups: { $nin: nonAdminGroups },
      shopId
    });
  }

  // regular users should get just their account
  return Collections.Accounts.find({
    userId: this.userId
  });
});

/**
 * Single account
 * @params {String} userId -  id of user to find
 */
Meteor.publish("UserAccount", function (userId) {
  check(userId, Match.OneOf(String, null));

  const shopId = Reaction.getShopId();
  if (Roles.userIsInRole(this.userId, ["admin", "owner"], shopId)) {
    return Collections.Accounts.find({
      userId
    });
  }
  return this.ready();
});

/**
 * userProfile
 * @deprecated since version 0.10.2
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
  const shopId = Reaction.getShopId();
  if (!shopId) {
    return this.ready();
  }
  const permissions = ["dashboard/orders", "owner", "admin",
    "dashboard/customers"];
  // no need to normal user so see his password hash
  const fields = {
    "emails": 1,
    "name": 1,
    "profile.lang": 1,
    "profile.firstName": 1,
    "profile.lastName": 1,
    "profile.familyName": 1,
    "profile.secondName": 1,
    "profile.name": 1,
    "services.twitter.profile_image_url_https": 1,
    "services.facebook.id": 1,
    "services.google.picture": 1,
    "services.github.username": 1,
    "services.instagram.profile_picture": 1
  };
  // TODO: this part currently not working as expected.
  // we could have three situation here:
  // 1 - registered user log in.
  // 2 - admin log in
  // 3 - admin want to get user data
  // I'm not sure about the 3rd case, but we do not cover 2nd case here, because
  // we can see a situation when anonymous user still represented by
  // `profileUserId`, but admin user already could be found by `this.userId`
  // In that case what we should do here?
  if (profileUserId !== this.userId && Roles.userIsInRole(
    this.userId,
    permissions, shopId ||
    Roles.userIsInRole(this.userId, permissions, Roles.GLOBAL_GROUP)
  )) {
    return Meteor.users.find({
      _id: profileUserId
    }, {
      fields
    });
  }

  return Meteor.users.find({
    _id: this.userId
  }, {
    fields
  });
});
