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
