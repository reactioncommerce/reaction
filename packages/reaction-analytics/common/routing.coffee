#
# Track pageviews after routing
#

###
# Use onRun instead of afterAction
# See: https://github.com/iron-meteor/iron-router/tree/0.9#custom-actions-and-hooks
###
Router.onRun ->
  # analyticsEnabled = ReactionCore.Collections.Packages.findOne({name: "reaction-analytics"}).enabled
  # # Check to make sure analytics are enabled before tracking.
  # if analyticsEnabled
  analyticsEvent =
    eventType: 'pageview'
    path: Iron.Location.get().path # per https://github.com/iron-meteor/iron-router/issues/289
  ReactionCore.Collections.AnalyticsEvents.insert analyticsEvent
