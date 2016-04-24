import { Discounts } from "/lib/collections";

/**
 * discounts
 */

Meteor.publish("Discounts", function () {
  const shopId = ReactionCore.getShopId();
  if (!shopId) {
    return this.ready();
  }
  return Discounts.find({
    shopId: shopId
  });
});
