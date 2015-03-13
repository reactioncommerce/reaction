Meteor.publish "AnalyticsEvents", ->
  return ReactionCore.Collections.AnalyticsEvents.find shopId: ReactionCore.getShopId(@)
