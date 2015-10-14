Template.coreOrderWorkflow.helpers({
  order() {
    let currentData = Template.currentData();

    return ReactionCore.Collections.Orders.findOne(currentData._id);
  },

  fulfillmentNumber(index) {
    return index + 1;
  },

  "isCompleted": function () {
    var order = Template.parentData(1);
    if (this.status === true) {
      return order.workflow.status;
    } else {
      return false;
    }
  },

  "isPending": function () {
    if (this.status === this.template) {
      return this.status;
    } else {
      return false;
    }
  }
});

/* when order is first viewed we'll push the order status to created*/
Template.coreOrderWorkflow.onRendered(function () {
  var order = Template.currentData();
  // force order created to always be completed.
  if (order.workflow.status === "coreOrderCreated") {
    Meteor.call("workflow/pushOrderWorkflow", "coreOrderWorkflow", "coreOrderCreated", order._id);
  }

  if (order.shipping) {
    if (order.shipping[0].workflow.status === "coreOrderCompleted") {
      Meteor.call("workflow/pushOrderShipmentWorkflow", "coreOrderShipmentWorkflow", "coreOrderCreated", order._id. order.shipping[0]._id);
    }
  }
});
