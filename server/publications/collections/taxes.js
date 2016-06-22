import { Taxes } from "/lib/collections";
import { Reaction } from "/server/api";

/**
 * taxes
 */

Meteor.publish("Taxes", function () {
  const shopId = Reaction.getShopId();
  if (!shopId) {
    return this.ready();
  }
  return Taxes.find({
    shopId: shopId
  });
});
