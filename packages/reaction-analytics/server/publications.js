Meteor.publish("AnalyticsEvents", function() {
  return ReactionCore.Collections.AnalyticsEvents.find({
    shopId: ReactionCore.getShopId(this)
  });
});
