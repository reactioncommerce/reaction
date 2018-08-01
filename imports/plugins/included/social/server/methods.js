import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Packages } from "/lib/collections";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import ReactionError from "/imports/plugins/core/graphql/lib/ReactionError";

export function updateSocialSetting(provider, field, value) {
  check(provider, String);
  check(field, String);
  check(value, Match.OneOf(String, Boolean));

  if (!Reaction.hasPermission(["reaction-social"])) {
    throw new ReactionError("access-denied", "Access Denied");
  }

  return Packages.update({
    name: "reaction-social",
    shopId: Reaction.getShopId()
  }, {
    $set: {
      [`settings.public.apps.${provider}.${field}`]: value
    }
  });
}

export function updateSocialSettings(values) {
  check(values, Match.OneOf(Object, String, Boolean, Number, null, undefined));

  if (!Reaction.hasPermission(["reaction-social"])) {
    throw new ReactionError("access-denied", "Access Denied");
  }

  return Packages.update({
    name: "reaction-social",
    shopId: Reaction.getShopId()
  }, {
    $set: {
      settings: values
    }
  });
}

Meteor.methods({
  "reaction-social/updateSocialSetting": updateSocialSetting,
  "reaction-social/updateSocialSettings": updateSocialSettings
});
