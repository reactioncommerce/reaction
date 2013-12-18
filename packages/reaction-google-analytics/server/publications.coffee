root = exports ? this

Meteor.publish("AnalyticsEvents", () ->
  root.AnalyticsEvents.find({shopId: Meteor.app.getCurrentShop(this)._id});
)
