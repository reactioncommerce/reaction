/**
 * stateHelperPayment events
 *
 */
Template.coreProcessPayment.events({
  'click .btn': function () {
    Meteor.call("shipmentShipped", this);
    Meteor.call("workflow/pushOrderWorkflow", "coreOrderWorkflow", "coreShipmentShipped", this._id);
  }
});
