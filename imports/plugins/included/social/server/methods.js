import { check } from "meteor/check"
import { SocialPackageConfig } from "/lib/collections/schemas/social";
import { Packages } from "/lib/collections";
import { Reaction } from "/server/api";

export default function updateSocialSetting(provider, field, value) {
  check(provider, String);
  check(field, String);
  check(value, Match.OneOf(String, Boolean));

  if (!Reaction.hasPermission(["reaction-social"])) {
    throw new Meteor.Error(403, "Access Denied");
  }

  return Packages.update({
    name: "reaction-social",
    shopId: Reaction.getShopId()
  }, {
    $set: {
      [`settings.public.apps.${provider}.${field}`]: value
    }
  })
}

Meteor.methods({
  "reaction-social/updateSocialSetting": updateSocialSetting
})
