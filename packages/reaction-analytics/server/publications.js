Meteor.publish("AnalyticsEvents", function () {
  const shopId = ReactionCore.getShopId();
  if (!shopId) {
    return this.ready();
  }
  return ReactionCore.Collections.AnalyticsEvents.find({
    shopId: shopId
  });
});
