import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Packages } from "/lib/collections";
import { Reaction } from "/server/api";

export function updateAnalyticsSettings(values) {
  check(values, Match.OneOf(Object, String, Boolean, Number, null, undefined));

  if (!Reaction.hasPermission(["reaction-analytics"])) {
    throw new Meteor.Error(403, "Access Denied");
  }

  return Packages.update({
    name: "reaction-analytics",
    shopId: Reaction.getShopId()
  }, {
    $set: {
      settings: values
    }
  });
}


Meteor.methods({
  "reaction-analytics/updateAnalyticsSettings": updateAnalyticsSettings
});
