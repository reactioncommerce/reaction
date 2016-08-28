import _ from "lodash";
import { Meteor } from "meteor/meteor";
import { Tracker } from "meteor/tracker";
import { Template } from "meteor/templating";
import { i18next } from "/client/api";
import { Orders } from "/lib/collections";

Template.coreOrderShippingSummary.onCreated(() => {
  const template = Template.instance();
  const currentData = Template.currentData();

  template.orderDep = new Tracker.Dependency;

  function getOrder(orderId, shipmentId) {
    template.orderDep.depend();
    return Orders.findOne({
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
  const template = Template.instance();
  const order = template.order;

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
    const template = Template.instance();
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
    const shipment = Template.instance().order.shipping[0];
    if (shipment.tracking) {
      return shipment.tracking;
    }

    return i18next.t("orderShipping.noTracking");
  },
  shipmentStatus() {
    const order = Template.instance().order;
    const shipment = Template.instance().order.shipping[0];
    const shipped = _.every(shipment.items, (shipmentItem) => {
      for (const fullItem of order.items) {
        if (fullItem._id === shipmentItem._id) {
          if (fullItem.workflow) {
            if (_.isArray(fullItem.workflow.workflow)) {
              return _.includes(fullItem.workflow.workflow, "coreOrderItemWorkflow/completed");
            }
          }
        }
      }
    });

    if (shipped) {
      return {
        shipped: true,
        status: "success",
        label: i18next.t("orderShipping.shipped")
      };
    }

    return {
      shipped: false,
      status: "info",
      label: i18next.t("orderShipping.notShipped")
    };
  }
});
