###
# OrderworkflowEvents
# override to change order processing workorder
###
OrderWorkflowEvents = [
    { name: "orderCreated", label: "New", from: "orderCreated", to: "shipmentTracking" }
    { name: "shipmentTracking", label: "Tracking Created", from: "orderCreated", to: "shipmentPrepare" }
    { name: "shipmentPrepare", label: "Ready", from: "shipmentTracking", to: "shipmentPacked"  }
    { name: "shipmentPacked", label: "Packed", from: "shipmentPrepare", to: "paymentCompleted"}
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
        orderId = order._id
        # manual add tracking (call these from shipment method to auto add)
        Meteor.call "addTracking", orderId, tracking
        Meteor.call "updateHistory",  orderId, "Tracking Added", tracking
        # create packing slips
        path = Router.routes['cartCompleted'].path({_id: orderId})
        Meteor.call "createPDF", path, (err,result) ->
          Meteor.call "updateDocuments", orderId, result, "packing"
          Meteor.call "updateHistory",  orderId, "Packing Slip Generated", result
          # move to preparation stage
          Meteor.call "updateWorkflow",orderId, "shipmentPrepare" if order?

      shipmentPrepare: (order) ->
        #completed when order documents printed and packed

      shipmentPacked: (order) ->
        # item is packed and ready to ship

      paymentCompleted: (order) ->
        # we have authorized order in cart flow, now complete payment transaction

      shipmentShipped: (order) ->
        #payment processed and order has shipped

      orderCompleted: (order) ->
        # mark order completed



      }
  )
