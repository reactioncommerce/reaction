/**
 * coreShipmentShipped events
 *
 */
Template.coreShipmentShipped.events({
  "click .btn": function () {
    Meteor.call("order/orderCompleted", this);
    Meteor.call("workflow/pushOrderWorkflow", "coreOrderWorkflow", "orderCompleted", this._id);
  }
});
