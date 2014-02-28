Template.orderDetail.helpers
  userProfile: () ->
    userId =  @.userId
    Meteor.subscribe "UserProfile",userId
    Users.findOne userId

  orderAge: () ->
    moment(@.createdAt).fromNow()

  shipmentTracking: ->
    @.shipping.shipmentMethod.tracking

  orderStateHelper: ->
    switch @.state
      when 'orderCreated' then Template['stateHelperTracking'](@)
      when 'shipmentTracking' then Template['spinner'](@)
      when 'shipmentPrepare' then Template['stateHelperDocuments'](@)
      when 'shipmentPacking' then Template['stateHelperPacking'](@)
      when 'processPayment' then Template['stateHelperPayment'](@)
      when 'shipmentShipped' then Template['stateHelperShipped'](@)
      when 'orderCompleted' then Template['stateHelperCompleted'](@)