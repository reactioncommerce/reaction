import { Shipping } from "/lib/collections";
import { Reaction } from "/server/api";

/**
 * shipping
 */

Meteor.publish("Shipping", function () {
  const shopId = Reaction.getShopId();
  if (!shopId) {
    return this.ready();
  }
  return Shipping.find({
    shopId: shopId
  });
});
