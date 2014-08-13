Template.orderDetail.helpers
  userProfile: () ->
    profileId =  @.userId
    if profileId?
      userProfile = Meteor.subscribe "UserProfile", profileId
      if userProfile.ready()
        return Meteor.users.findOne profileId

  orderAge: () ->
    moment(@.createdAt).fromNow()

  shipmentTracking: ->
    @.shipping.shipmentMethod.tracking

  orderStateHelper: () ->
    switch @.state
      when 'orderCreated' then Template.stateHelperTracking
      when 'shipmentTracking' then Template.spinner
      when 'shipmentPrepare' then Template.stateHelperDocuments
      when 'shipmentPacking' then Template.stateHelperPacking
      when 'processPayment' then Template.stateHelperPayment
      when 'shipmentShipped' then Template.stateHelperShipped
      when 'orderCompleted' then Template.stateHelperCompleted