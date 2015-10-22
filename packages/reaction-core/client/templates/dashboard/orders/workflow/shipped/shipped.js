/**
 * coreShipmentShipped events
 *
 */
Template.coreShipmentShipped.events({
  "click .btn": function () {
    Meteor.call("order/orderShipped", this._id);
    Meteor.call("workflow/pushOrderWorkflow", "coreOrderShipmentWorkflow", "orderShipped", this._id);
  }
});
