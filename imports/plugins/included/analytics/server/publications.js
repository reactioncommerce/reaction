import { Meteor } from "meteor/meteor";
import { AnalyticsEvents } from "/lib/collections";
import { Reaction } from "/lib/api";

Meteor.publish("AnalyticsEvents", function () {
  const shopId = Reaction.getShopId(this.userId);
  if (!shopId) {
    return this.ready();
  }
  return AnalyticsEvents.find({ shopId });
});
