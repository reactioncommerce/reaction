
Template.coreOrderShippingSummary.onCreated(() => {
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

/*
 * automatically start order processing on first view
 */

Template.coreOrderShippingSummary.onRendered(function () {
  let template = Template.instance();
  let order = template.order;

  if (order.workflow) {
    if (order.workflow.status === "coreOrderCreated") {
      order.workflow.status = "coreOrderCreated";
      Meteor.call("workflow/pushOrderWorkflow", "coreOrderWorkflow", "coreOrderCreated", order);
    }
  }
});

/**
 * coreOrderCreated events
 *
 */
Template.coreOrderShippingSummary.events({
  "click .btn": function () {
    Meteor.call("workflow/pushOrderWorkflow", "coreOrderWorkflow", "coreOrderCreated", this);
  }
});


Template.coreOrderShippingSummary.helpers({
  order() {
    let template = Template.instance();
    return template.order;
  },
  shipment() {
    return Template.instance().order.shipping[0];
  },

  paymentProcessor() {
    const processor = Template.instance().order.billing[0].paymentMethod.processor;
    return {
      name: processor.toLowerCase(),
      label: processor
    };
  },

  tracking() {
    let shipment = Template.instance().order.shipping[0];
    if (shipment.tracking) {
      return shipment.tracking;
    }

    return i18n.t("orderShipping.noTracking");
  },
  shipmentStatus() {
    const order = Template.instance().order;
    const shipment = Template.instance().order.shipping[0];
    const shipped = _.every(shipment.items, (shipmentItem) => {
      for (let fullItem of order.items) {
        if (fullItem._id === shipmentItem._id) {
          if (fullItem.workflow) {
            if (_.isArray(fullItem.workflow.workflow)) {
              return _.contains(fullItem.workflow.workflow, "coreOrderItemWorkflow/completed");
            }
          }
        }
      }
    });

    if (shipped) {
      return {
        shipped: true,
        status: "success",
        label: i18n.t("orderShipping.shipped")
      };
    }

    return {
      shipped: false,
      status: "info",
      label: i18n.t("orderShipping.notShipped")
    };
  }
});
