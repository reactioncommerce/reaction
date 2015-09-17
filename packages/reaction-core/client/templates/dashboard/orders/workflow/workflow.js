Template.coreOrderWorkflow.helpers({
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

});
