###
# OrderworkflowEvents
# override to change order processing workorder
###
OrderWorkflowEvents = [
    { name: "orderCreated", label: "Ready", from: "orderCreated", to: "shipmentTracking" }
    { name: "shipmentTracking", label: "Documents", from: "orderCreated", to: "shipmentPrepare" }
    { name: "shipmentPrepare", label: "Preparing", from: "shipmentTracking", to: "shipmentPacking"  }
    { name: "shipmentPacking", label: "Packing", from: "shipmentPrepare", to: "processPayment"}
    { name: "processPayment", label: "Payment Processing", from: "shipmentPacking", to: "shipmentShipped"}
    { name: "shipmentShipped", label: "Shipped", from: "processPayment", to: "orderCompleted" }
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
          # move to preparation stage
          Meteor.call "updateWorkflow",orderId, "shipmentPrepare" if order?

      shipmentPrepare: (order) ->
        #completed when order documents printed and packed
        Meteor.call "updateWorkflow",order._id, "shipmentPacking" if order?

      shipmentPacking: (order) ->
        # item is packed and ready to ship
        Meteor.call "updateWorkflow",order._id, "processPayment" if order?
        @.processPayment(order)

      processPayment: (order) ->
        # we have authorized order in cart flow, now complete payment transaction
        Meteor.call "processPayments", order._id, (error,result) ->
          if result
            Meteor.call "updateWorkflow",order._id, "shipmentShipped"
            OrderWorkflow.shipmentShipped(order)

      shipmentShipped: (order) ->
        #payment processed and order has shipped
        Meteor.call "updateWorkflow",order._id, "orderCompleted" if order?
        @.orderCompleted(order)

      orderCompleted: (order) ->
        # mark order completed
        Meteor.call "updateWorkflow",order._id, "orderCompleted" if order?
      }
  )
