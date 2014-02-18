Template.orders.helpers
  orders: () ->
    Orders.find()

  fulfillmentWorkflow: ->
    # to define fulfillment workflow, alter OrderWorkflowEvents
    fulfillmentWorkflow = []
    fulfillmentWorkflowKeys = Object.keys(OrderWorkflow)
    for key of OrderWorkflow
      for events,index in OrderWorkflowEvents
        if events.name is key
          count = Orders.find({state: key }).count()
          value = key
          if (count > 0 or displayNext isnt false)
            if count is 0 then displayNext = false
            fulfillmentWorkflow.push {index: index, count:count,value:value,label: events.label}
    fulfillmentWorkflow

Template.orderDetail.helpers
  userProfile: () ->
    userId =  @.userId
    Meteor.subscribe "UserProfile",userId
    Users.findOne userId

  orderAge: () ->
    moment(@.createdAt).fromNow()

  shipmentTracking: ->
    @.shipping.shipmentMethod.tracking


Template.orderTracking.events
  "submit": (event,template) ->
    event.preventDefault()
    tracking =  $(event.target).find("[name=input-tracking-code]").val()
    #transition order to next workflow
    currentState = Orders.findOne(@._id).state
    OrderWorkflow.current = currentState
    OrderWorkflow[currentState](@,tracking)
    #save tracking
    OrderWorkflow.shipmentTracking @, tracking