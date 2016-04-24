import { Shipping } from "/lib/collections";

/**
 * shipping
 */

Meteor.publish("Shipping", function () {
  const shopId = ReactionCore.getShopId();
  if (!shopId) {
    return this.ready();
  }
  return Shipping.find({
    shopId: shopId
  });
});
