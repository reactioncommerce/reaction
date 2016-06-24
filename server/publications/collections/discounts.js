import { Discounts } from "/lib/collections";
import { Reaction } from "/server/api";

/**
 * discounts
 */

Meteor.publish("Discounts", function () {
  const shopId = Reaction.getShopId();
  if (!shopId) {
    return this.ready();
  }
  return Discounts.find({
    shopId: shopId
  });
});
