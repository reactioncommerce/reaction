import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Packages } from "/lib/collections";
import { Reaction } from "/server/api";

export function updateStatus(provider, field, value) {
  check(provider, String);
  check(field, String);
  check(value, Match.OneOf(String, Boolean));

  if (!Reaction.hasPermission(["reaction-analytics"])) {
    throw new Meteor.Error(403, "Access Denied");
  }

  return Packages.update({
    name: "reaction-analytics",
    shopId: Reaction.getShopId()
  }, {
    $set: {
      [`settings.public.${provider}.${field}`]: value
    }
  });
}

export function updateAnalyticsSettings(data, provider) {
  check(data, String);
  check(provider, String);


  if (!Reaction.hasPermission(["reaction-analytics"])) {
    throw new Meteor.Error(403, "Access Denied");
  }

  return Packages.update({
    name: "reaction-analytics",
    shopId: Reaction.getShopId()
  }, {
    $set: {
      [`settings.public.${provider}.api_key`]: data
    }
  });
}


Meteor.methods({
  "reaction-analytics/updateStatus": updateStatus,
  "reaction-analytics/updateAnalyticsSettings": updateAnalyticsSettings
});
