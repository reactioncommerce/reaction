import { AnalyticsEvents } from "/lib/collections";
import { Reaction } from "/lib/api";

Meteor.publish("AnalyticsEvents", function () {
  const shopId = Reaction.getSellerShopId(this.userId);
  if (!shopId) {
    return this.ready();
  }
  return AnalyticsEvents.find({ shopId });
});
