ReactionCore.Collections.AnalyticsEvents.allow({
  insert: function(userId, analyticsEvent) {
    if (Match.test(analyticsEvent, ReactionCore.Schemas.AnalyticsEvents)) {
      return true
    }
    return false
  },
  update: function(userId, analyticsEvent, fields, modifier) {
    if (modifier.$set && modifier.$set.shopId) {
      return false;
    }
    return true;
  },
  remove: function(userId, analyticsEvent) {
    if (analyticsEvent.shopId !== ReactionCore.getShopId()) {
      return false;
    }
    return true;
  }
});
