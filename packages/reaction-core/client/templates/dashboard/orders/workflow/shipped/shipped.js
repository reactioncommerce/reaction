Template.coreShipmentShipped.onCreated(() => {
  let template = Template.instance();
  let currentData = Template.currentData();

  template.orderDep = new Tracker.Dependency;

  function getOrder(orderId, shipmentId) {
    template.orderDep.depend();
    return ReactionCore.Collections.Orders.findOne({
      "_id": orderId,
      "shipping._id": shipmentId
    });
  }

  Tracker.autorun(() => {
    template.order = getOrder(currentData.orderId, currentData.fulfillment._id);
  });
});

/**
 * coreShipmentShipped events
 *
 */
Template.coreShipmentShipped.events({
  "click [data-event-action=shipmentShipped]": function () {
    let template = Template.instance();
    console.log("Shipment thing", template);
    Meteor.call("orders/shipmentShipped", template.order);
    // Meteor.call("workflow/pushOrderShipmentWorkflow", "coreOrderShipmentWorkflow", "orderShipped", this._id);
  }
});

Template.coreShipmentShipped.helpers({
  order() {
    return Template.instance().order;
  },
  shipment() {
    return Template.instance().order.shipping[0];
  },
  shipmentReady() {
    let order = Template.instance().order;
    let shipment = order.shipping[0];

    return shipment.packed && shipment.tracking;
  }
});
