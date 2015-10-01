/**
 * stateHelperPayment events
 *
 */
Template.coreProcessPayment.events({
  "click .btn": function () {
    Meteor.call("orders/shipmentShipped", this);
    Meteor.call("workflow/pushOrderWorkflow", "coreOrderWorkflow", "coreShipmentShipped", this._id);
  }
});
