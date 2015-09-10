/**
 * coreShipmentPrepare helpers and events
 *
 */
Template.coreShipmentPrepare.helpers({
  documents: function () {}
});

Template.coreShipmentPrepare.events({
  'click .download-documents': function () {
    Meteor.call("shipmentPrepare", this);
    Meteor.call("layout/workflow", "coreOrderWorkflow", "coreShipmentPrepare");
  }
});
