root = exports ? this

Meteor.publish("AnalyticsEvents", () ->
  root.AnalyticsEvents.find({shopId: Meteor.app.getCurrentShop(this)._id});
)

root.AnalyticsEvents.allow
  insert: (userId, analyticsEvent) ->
    analyticsEvent.shopId = Meteor.app.getCurrentShop()._id;
    true
  update: (userId, analyticsEvent, fields, modifier) ->
    if modifier.$set && modifier.$set.shopId
      false
    true
  remove: (userId, analyticsEvent) ->
    analyticsEvent.shopId == Meteor.app.getCurrentShop()._id
