
/**
* OrderworkflowEvents
* override to change order processing workorder
*/


var OrderWorkflow, OrderWorkflowEvents;

OrderWorkflowEvents = [
  {
    name: "orderCreated",
    label: "Ready",
    from: "orderCreated",
    to: "shipmentTracking"
  }, {
    name: "shipmentTracking",
    label: "Documents",
    from: "orderCreated",
    to: "shipmentPrepare"
  }, {
    name: "shipmentPrepare",
    label: "Preparing",
    from: "shipmentTracking",
    to: "shipmentPacking"
  }, {
    name: "shipmentPacking",
    label: "Packing",
    from: "shipmentPrepare",
    to: "processPayment"
  }, {
    name: "processPayment",
    label: "Payment Processing",
    from: "shipmentPacking",
    to: "shipmentShipped"
  }, {
    name: "shipmentShipped",
    label: "Shipped",
    from: "processPayment",
    to: "orderCompleted"
  }, {
    name: "orderCompleted",
    label: "Completed",
    from: "shipmentShipped"
  }
];


/**
 * Orders Workflow events
 * orderWorkflow has no persistent state
 *
 * get the next order workflow and transition order:
 *
 *   currentState = Orders.findOne(@._id).state
 *   OrderWorkflow.current = currentState
 *   OrderWorkflow[currentState](@,tracking)
 *
 * callback events are evoked without events:
 *
 *   OrderWorkflow.shipmentTracking @, tracking
 */

OrderWorkflow = new StateMachine.create({
  initial: "orderCreated",
  events: OrderWorkflowEvents,
  callbacks: {
    onenterstate: function(event, from, to, order) {
      if (order != null) {
        return Meteor.call("updateWorkflow", order._id, to);
      }
    },
    shipmentTracking: function(order, tracking) {
      var orderId;
      check(order, Object);
      check(tracking, String);
      orderId = order._id;
      Meteor.call("addTracking", orderId, tracking);
      Meteor.call("updateHistory", orderId, "Tracking Added", tracking);
      return Meteor.call("updateWorkflow", orderId, "shipmentPrepare");
    },
    shipmentPrepare: function(order) {
      if (order != null) {
        return Meteor.call("updateWorkflow", order._id, "shipmentPacking");
      }
    },
    shipmentPacking: function(order) {
      if (order != null) {
        Meteor.call("updateWorkflow", order._id, "processPayment");
      }
      return this.processPayment(order);
    },
    processPayment: function(order) {
      return Meteor.call("processPayments", order._id, function(error, result) {
        if (result) {
          Meteor.call("updateWorkflow", order._id, "shipmentShipped");
          return OrderWorkflow.shipmentShipped(order);
        }
      });
    },
    shipmentShipped: function(order) {
      if (order != null) {
        Meteor.call("updateWorkflow", order._id, "orderCompleted");
      }
      return this.orderCompleted(order);
    },
    orderCompleted: function(order) {
      if (order != null) {
        return Meteor.call("updateWorkflow", order._id, "orderCompleted");
      }
    }
  }
});
