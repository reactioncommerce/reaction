import { Tags } from "/lib/collections";

/**
 * tags
 */
Meteor.publish("Tags", function () {
  const shopId = ReactionCore.getShopId();
  if (!shopId) {
    return this.ready();
  }
  return Tags.find({
    shopId: shopId
  });
});
