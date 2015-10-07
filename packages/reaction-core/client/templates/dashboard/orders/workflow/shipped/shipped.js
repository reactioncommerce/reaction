/**
 * coreShipmentShipped events
 *
 */
Template.coreShipmentShipped.events({
  "click .btn": function () {
    Meteor.call("order/orderShipped", this._id);
    Meteor.call("workflow/pushOrderWorkflow", "coreOrderWorkflow", "orderShipped", this._id);
  }
});
