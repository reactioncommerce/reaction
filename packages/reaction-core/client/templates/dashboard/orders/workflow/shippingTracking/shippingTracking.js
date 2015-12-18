Template.coreOrderShippingTracking.onCreated(() => {
  let template = Template.instance();
  let currentData = Template.currentData();

  template.orderDep = new Tracker.Dependency;
  template.showTrackingEditForm = ReactiveVar(false);

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
Template.coreOrderShippingTracking.events({
  "click [data-event-action=shipmentShipped]": function () {
    let template = Template.instance();
    console.log("!!!");
    Meteor.call("orders/shipmentShipped", template.order);
    // Meteor.call("workflow/pushOrderShipmentWorkflow", "coreOrderShipmentWorkflow", "orderShipped", this._id);
  },

  "click [data-event-action=resendNotification]": function () {
    let template = Template.instance();
    Meteor.call("orders/sendNotification", template.order);
  },

  "click [data-event-action=shipmentPacked]": () => {
    const template = Template.instance();

    Meteor.call("orders/shipmentPacked", template.order, template.order.shipping[0], true);
  },

  "submit form[name=addTrackingForm]": (event, template) => {
    event.preventDefault();
    event.stopPropagation();

    const currentData = Template.currentData();
    const order = template.order;
    const shipment = currentData.fulfillment;
    const tracking = event.target.trackingNumber.value;

    Meteor.call("orders/updateShipmentTracking", order, shipment, tracking,
      (error) => {
        if (!error) {
          template.orderDep.changed();
          template.showTrackingEditForm.set(false);
        }
      });
  },
  "click [data-event-action=editTracking]": (event, template) => {
    template.showTrackingEditForm.set(true);
  }
});

Template.coreOrderShippingTracking.helpers({
  editTracking() {
    let template = Template.instance();
    if (!template.order.shipping[0].tracking || template.showTrackingEditForm.get()) {
      return true;
    }
    return false;
  },
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
