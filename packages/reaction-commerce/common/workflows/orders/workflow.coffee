###
# OrderworkflowEvents
# override to change order processing workorder
###
OrderWorkflowEvents = [
    { name: "orderCreated", label: "New", from: "orderCreated", to: "shipmentTracking" }
    { name: "shipmentTracking", label: "Tracking Created", from: "orderCreated", to: "shipmentLabel" }
    { name: "shipmentLabel", label: "Printed", from: "shipmentTracking", to: "shipmentPacked"  }
    { name: "shipmentPacked", label: "Packed", from: "shipmentLabel", to: "paymentCompleted"}
    { name: "paymentCompleted", label: "Payment Completed", from: "shipmentPacked", to: "shipmentShipped"}
    { name: "shipmentShipped", label: "Shipped", from: "shipmentShipped", to: "orderCompleted" }
    { name: "orderCompleted",label: "Completed", from: "shipmentShipped"}
  ]

###
# Orders Workflow events
# orderWorkflow has no persistent state
#
# get the next order workflow and transition order:
#
#   currentState = Orders.findOne(@._id).state
#   OrderWorkflow.current = currentState
#   OrderWorkflow[currentState](@,tracking)
#
# callback events are evoked without events:
#
#   OrderWorkflow.shipmentTracking @, tracking
###

OrderWorkflow = new StateMachine.create(
    initial: "orderCreated"
    events: OrderWorkflowEvents
    callbacks: {
      onenterstate: (event, from, to, order) ->
        #transition order when OrderWorkflow is defined is called
        Meteor.call "updateWorkflow",order._id, to if order?
        # Session.set("OrderWorkflow",to) if Session?

      shipmentTracking: (order, tracking) ->
        Meteor.call "addTracking", order._id, tracking
      }
  )
