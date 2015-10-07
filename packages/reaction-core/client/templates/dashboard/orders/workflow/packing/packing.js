/**
 * stateHelperPacking events
 *
 */
Template.coreShipmentPacking.events({
  "click .btn": function () {
    Meteor.call("orders/shipmentPacking", this);
    Meteor.call("workflow/pushOrderWorkflow", "coreOrderWorkflow", "coreShipmentPacking", this._id);
  }
});
