import { Meteor } from "meteor/meteor";
import { Tracker } from "meteor/tracker";
import { ReactiveVar } from "meteor/reactive-var";
import { Template } from "meteor/templating";
import { i18next, Reaction } from "/client/api";
import { Orders } from "/lib/collections";
import { getShippingInfo } from "../../helpers";

Template.coreOrderShippingTracking.onCreated(() => {
  const template = Template.instance();
  const currentData = Template.currentData();

  template.orderDep = new Tracker.Dependency();
  template.showTrackingEditForm = ReactiveVar(false);

  function getOrder(orderId, shipmentId) {
    template.orderDep.depend();
    return Orders.findOne({
      "_id": orderId,
      "shipping._id": shipmentId
    });
  }

  Tracker.autorun(() => {
    template.order = getOrder(currentData.orderId, currentData.fulfillment && currentData.fulfillment._id);
  });
});

/**
 * coreShipmentShipped events
 *
 */
Template.coreOrderShippingTracking.events({
  "click [data-event-action=refresh-shipping]"() {
    const instance = Template.instance();
    instance.$("#btn-processing").removeClass("hidden");
    const orderId = Template.instance().order._id;
    Meteor.call("shipping/status/refresh", orderId, (result) => {
      if (result && result.error) {
        instance.$("#btn-processing").addClass("hidden");
        Alerts.toast(i18next.t("orderShipping.labelError", { error: result.error }), "error", { timeout: 7000 });
      }
    });
  },
  "click [data-event-action=shipmentShipped]"() {
    const template = Template.instance();
    const shipment = getShippingInfo(template.order);
    Meteor.call("orders/shipmentShipped", template.order, shipment, (error) => {
      if (error) {
        Alerts.toast(i18next.t("mail.alerts.cantSendEmail"), "error");
      } else {
        Alerts.toast(i18next.t("mail.alerts.emailSent"), "success");
      }
    });

    // send notification to order owner
    const { userId } = template.order;
    const type = "orderShipped";
    const prefix = Reaction.getShopPrefix();
    const url = `${prefix}/notifications`;
    const sms = true;
    Meteor.call("notification/send", userId, type, url, sms);

    // Meteor.call("workflow/pushOrderShipmentWorkflow", "coreOrderShipmentWorkflow", "orderShipped", this._id);
  },

  "click [data-event-action=resendNotification]"() {
    const template = Template.instance();
    Meteor.call("orders/sendNotification", template.order, "shipped", (error) => {
      if (error) {
        Alerts.toast(i18next.t("mail.alerts.cantSendEmail"), "error");
      } else {
        Alerts.toast(i18next.t("mail.alerts.emailSent"), "success");
      }
    });
  },

  "click [data-event-action=shipmentPacked]": () => {
    const template = Template.instance();
    const shipment = getShippingInfo(template.order);

    Meteor.call("orders/shipmentPacked", template.order, shipment);
  },

  "submit form[name=addTrackingForm]": (event, template) => {
    event.preventDefault();
    event.stopPropagation();

    const currentData = Template.currentData();
    const { order } = template;
    const shipment = currentData.fulfillment;
    const tracking = event.target.trackingNumber.value;

    Meteor.call("orders/updateShipmentTracking", order, shipment, tracking, (error) => {
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
  printableLabels() {
    const { order } = Template.instance();
    const shipment = getShippingInfo(order);

    if (shipment) {
      const { shippingLabelUrl, customsLabelUrl } = shipment;
      if (shippingLabelUrl || customsLabelUrl) {
        return { shippingLabelUrl, customsLabelUrl };
      }
    }

    return false;
  },
  isShipped() {
    const currentData = Template.currentData();
    const { order } = Template.instance();

    const shippedItems = currentData.fulfillment && currentData.fulfillment.items.every((shipmentItem) => {
      const fullItem = order.items.find((orderItem) => {
        if (orderItem._id === shipmentItem._id) {
          return true;
        }
        return false;
      });

      return !fullItem.workflow.workflow.includes("coreOrderItemWorkflow/shipped");
    });

    return shippedItems;
  },

  isNotCanceled() {
    const currentData = Template.currentData();
    const { order } = Template.instance();

    const canceledItems = currentData.fulfillment && currentData.fulfillment.items.every((shipmentItem) => {
      const fullItem = order.items.find((orderItem) => {
        if (orderItem._id === shipmentItem._id) {
          return true;
        }
        return false;
      });

      return fullItem.workflow.status !== "coreOrderItemWorkflow/canceled";
    });

    return canceledItems;
  },

  isCompleted() {
    const currentData = Template.currentData();
    const { order } = Template.instance();

    const completedItems = currentData.fulfillment && currentData.fulfillment.items.every((shipmentItem) => {
      const fullItem = order.items.find((orderItem) => {
        if (orderItem._id === shipmentItem._id) {
          return true;
        }
        return false;
      });

      if (Array.isArray(fullItem.workflow.workflow)) {
        return fullItem.workflow.workflow.includes("coreOrderItemWorkflow/completed");
      }

      return false;
    });

    return completedItems;
  },

  editTracking() {
    // TODO move to a method where we loop package settings
    // to determine if this feature is enabled.
    // somewhere in here is where I wish this was converted to React!
    const { settings } = Reaction.getPackageSettings("reaction-shipping-rates");
    // TODO: future proof by not using flatRates, but rather look for editable:true
    if (settings && settings.flatRates.enabled === true) {
      const template = Template.instance();
      const { order } = template;
      const shipment = getShippingInfo(order);
      const editing = template.showTrackingEditForm.get();
      let view = false;
      if (editing === true || (!shipment.tracking && editing === false)) {
        view = true;
      }
      // TODO modularize tracking more, editable to settings
      if (view && shipment.shipmentMethod.carrier === "Flat Rate") {
        return true;
      }
    }
    return false;
  },
  order() {
    return Template.instance().order;
  },
  shipment() {
    const { order } = Template.instance();
    return getShippingInfo(order);
  },
  shipmentReady() {
    const { order } = Template.instance();
    const shipment = getShippingInfo(order);
    const shipmentWorkflow = shipment.workflow;

    return (shipmentWorkflow && Array.isArray(shipmentWorkflow.workflow) && shipmentWorkflow.workflow.includes("coreOrderWorkflow/packed") && shipment.tracking)
      || (shipmentWorkflow && Array.isArray(shipmentWorkflow.workflow) && shipmentWorkflow.workflow.includes("coreOrderWorkflow/packed"));
  }
});
