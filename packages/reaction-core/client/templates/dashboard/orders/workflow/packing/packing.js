/**
 * stateHelperPacking events
 *
 */
Template.coreShipmentPacking.events({
  'click .btn': function () {
    Meteor.call("shipmentPacking", this);
    Meteor.call("layout/workflow", "coreOrderWorkflow", "coreShipmentPacking");
  }
});
