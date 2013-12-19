Meteor.publish("AnalyticsEvents", () ->
  share.AnalyticsEvents.find({shopId: Meteor.app.getCurrentShop(this)._id});
)
