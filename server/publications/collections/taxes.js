import { Taxes } from "/lib/collections";

/**
 * taxes
 */

Meteor.publish("Taxes", function () {
  const shopId = ReactionCore.getShopId();
  if (!shopId) {
    return this.ready();
  }
  return Taxes.find({
    shopId: shopId
  });
});
