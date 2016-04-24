import { AnalyticsEvents } from "/lib/collections";

Meteor.publish("AnalyticsEvents", function () {
  const shopId = ReactionCore.getShopId();
  if (!shopId) {
    return this.ready();
  }
  return AnalyticsEvents.find({
    shopId: shopId
  });
});
