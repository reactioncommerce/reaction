/**
 * stateHelperPayment events
 *
 */
Template.coreProcessPayment.events({
  'click .btn': function () {
    Meteor.call("shipmentShipped", this);
    Meteor.call("layout/workflow", "coreOrderWorkflow", "coreShipmentShipped");
  }
});
