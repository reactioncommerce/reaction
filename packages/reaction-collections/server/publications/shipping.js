/**
 * shipping
 */

Meteor.publish("Shipping", function () {
  const shopId = ReactionCore.getShopId();
  if (!shopId) {
    return this.ready();
  }
  return ReactionCore.Collections.Shipping.find({
    shopId: shopId
  });
});
