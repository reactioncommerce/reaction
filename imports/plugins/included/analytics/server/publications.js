import { AnalyticsEvents } from "/lib/collections";
import { Reaction } from "/server/api";

Meteor.publish("AnalyticsEvents", function () {
  const shopId = Reaction.getShopId();
  if (!shopId) {
    return this.ready();
  }
  return AnalyticsEvents.find({
    shopId: shopId
  });
});
