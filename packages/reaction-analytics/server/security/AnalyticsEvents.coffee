ReactionCore.Collections.AnalyticsEvents.allow
  insert: (userId, analyticsEvent) ->
    analyticsEvent.shopId = ReactionCore.getShopId()
    return true
  update: (userId, analyticsEvent, fields, modifier) ->
    if modifier.$set && modifier.$set.shopId
      return false
    return true
  remove: (userId, analyticsEvent) ->
    if analyticsEvent.shopId != ReactionCore.getShopId()
      return false
    return true
