/**
 * stateHelperPacking events
 *
 */
Template.coreShipmentPacking.events({
  'click .btn': function () {
    Meteor.call("shipmentPacking", this);
    Meteor.call("workflow/pushOrderWorkflow", "coreOrderWorkflow", "coreShipmentPacking", this._id);
  }
});
