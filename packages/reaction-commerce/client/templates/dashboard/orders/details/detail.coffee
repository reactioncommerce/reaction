Template.orderDetail.helpers
  userProfile: () ->
    userId =  @.userId
    Meteor.subscribe "UserProfile",userId
    Users.findOne userId

  orderAge: () ->
    moment(@.createdAt).fromNow()

  shipmentTracking: ->
    @.shipping.shipmentMethod.tracking
