/**
 * stateHelperPayment events
 *
 */
Template.coreProcessPayment.events({
  "click .btn": function () {
    Meteor.call("orders/capturePayments", this._id);
    Meteor.call("workflow/pushOrderWorkflow", "coreOrderWorkflow", "coreProcessPayment", this._id);
  }
});

Template.coreProcessPayment.helpers({
  order() {
    let order = Template.currentData();
    return ReactionCore.Collections.Orders.findOne(order._id);
  }
});
