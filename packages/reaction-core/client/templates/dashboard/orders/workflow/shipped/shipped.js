/**
 * workflowhipped events
 *
 */
Template.coreShipmentShipped.events({
  'click .btn': function () {
    Meteor.call("orderCompleted", this)
    Meteor.call("layout/workflow", "coreOrderWorkflow", "orderCompleted");
  }
});
