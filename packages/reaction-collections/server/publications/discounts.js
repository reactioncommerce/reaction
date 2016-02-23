
/**
 * discounts
 */

Meteor.publish("Discounts", function () {
  const shopId = ReactionCore.getShopId();
  if (!shopId) {
    return this.ready();
  }
  return ReactionCore.Collections.Discounts.find({
    shopId: shopId
  });
});
