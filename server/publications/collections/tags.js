import { Meteor } from "meteor/meteor";
import { Tags } from "/lib/collections";
import { Reaction } from "/server/api";

/**
 * tags
 */
Meteor.publish("Tags", function () {
  const shopId = Reaction.getShopId();
  const primaryShopId = Reaction.getPrimaryShopId();
  if (!shopId) {
    return this.ready();
  }
  return Tags.find({
    shopId: {
      $in: [shopId, primaryShopId]
    }
  });
});
