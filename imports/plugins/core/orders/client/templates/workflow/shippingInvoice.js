import accounting from "accounting-js";
import _ from "lodash";
import { Meteor } from "meteor/meteor";
import { $ } from "meteor/jquery";
import { Template } from "meteor/templating";
import { ReactiveVar } from "meteor/reactive-var";
import { ReactiveDict } from "meteor/reactive-dict";
import { i18next, Logger, Reaction } from "/client/api";
import { Orders, Shops, Packages } from "/lib/collections";
import InvoiceContainer from "../../containers/invoiceContainer.js";
import { getBillingInfo } from "../../helpers";

// helper to return the order payment object
// the first credit paymentMethod on the order
// returns entire payment method
function orderCreditMethod(order) {
  const creditMethods = order.billing && order.billing.filter((value) => value && value.paymentMethod && value.paymentMethod.method === "credit");
  const creditMethod = creditMethods && creditMethods.find((billing) => billing && billing.shopId === Reaction.getShopId());
  return creditMethod || {};
}

//
// core order shipping invoice templates
//
Template.coreOrderShippingInvoice.onCreated(function () {
  this.state = new ReactiveDict();
  this.refunds = new ReactiveVar([]);
  this.refundAmount = new ReactiveVar(0.00);
  this.state.setDefault({
    isCapturing: false,
    isRefunding: false,
    isFetching: false
  });

  this.autorun(() => {
    const currentData = Template.currentData();
    const order = Orders.findOne(currentData.orderId);
    const shop = Shops.findOne({});

    this.state.set("order", order);
    this.state.set("currency", shop.currencies[shop.currency]);
    this.state.set("isFetching", true);

    if (order) {
      Meteor.call("orders/refunds/list", order, (error, result) => {
        if (error) Logger.warn(error);
        this.refunds.set(result);
        this.state.set("isFetching", false);
      });
    }
  });
});

Template.coreOrderShippingInvoice.helpers({
  currentData() {
    const currentData = Template.currentData();
    return currentData;
  },
  order() {
    const instance = Template.instance();
    const order = instance.state.get("order");
    return order;
  },
  currency() {
    const instance = Template.instance();
    const currency = instance.state.get("currency");
    return currency;
  },
  refunds() {
    const refunds = Template.instance().refunds.get();
    if (Array.isArray(refunds)) {
      return refunds.reverse();
    }

    return refunds;
  },
  isCapturing() {
    const instance = Template.instance();
    if (instance.state.get("isCapturing")) {
      instance.$(":input").attr("disabled", true);
      instance.$("#btn-capture-payment").text("Capturing");
      return true;
    }
    return false;
  },
  isRefunding() {
    const instance = Template.instance();
    if (instance.state.get("isRefunding")) {
      instance.$("#btn-refund-payment").text(i18next.t("order.refunding"));
      return true;
    }
    return false;
  },
  isFetching() {
    const instance = Template.instance();
    if (instance.state.get("isFetching")) {
      return true;
    }
    return false;
  },

  InvoiceContainer() {
    return InvoiceContainer;
  }
});

/**
 * coreOrderAdjustments events
 */
Template.coreOrderShippingInvoice.events({
  /**
   * Click Start Cancel Order
   * @param {Event} event - Event Object
   * @param {Template} instance - Blaze Template
   * @return {void}
   */
  "click [data-event-action=cancelOrder]": (event, instance) => {
    event.preventDefault();
    const order = instance.state.get("order");
    const invoiceTotal = getBillingInfo(order).invoice && getBillingInfo(order).invoice.total;
    const currencySymbol = instance.state.get("currency").symbol;
    const { paymentMethod } = getBillingInfo(order);

    Meteor.subscribe("Packages", Reaction.getShopId());
    const packageId = paymentMethod && paymentMethod.paymentPackageId;
    const settingsKey = paymentMethod && paymentMethod.paymentSettingsKey;
    // check if payment provider supports de-authorize
    const checkSupportedMethods = Packages.findOne({
      _id: packageId
    }).settings[settingsKey].support;

    const orderStatus = paymentMethod && paymentMethod.status;
    const orderMode = paymentMethod && paymentMethod.mode;

    let alertText;
    if (_.includes(checkSupportedMethods, "de-authorize") ||
      (orderStatus === "completed" && orderMode === "capture")) {
      alertText = i18next.t("order.applyRefundDuringCancelOrder", { currencySymbol, invoiceTotal });
    }

    Alerts.alert({
      title: i18next.t("order.cancelOrder"),
      text: alertText,
      type: "warning",
      showCancelButton: true,
      showCloseButton: true,
      confirmButtonColor: "#98afbc",
      cancelButtonColor: "#98afbc",
      confirmButtonText: i18next.t("order.cancelOrderNoRestock"),
      cancelButtonText: i18next.t("order.cancelOrderThenRestock")
    }, (isConfirm, cancel) => {
      let returnToStock;
      if (isConfirm) {
        returnToStock = false;
        return Meteor.call("orders/cancelOrder", order, returnToStock, (err) => {
          if (err) {
            $(".alert").removeClass("hidden").text(err.message);
          }
        });
      }
      if (cancel === "cancel") {
        returnToStock = true;
        return Meteor.call("orders/cancelOrder", order, returnToStock, (err) => {
          if (err) {
            $(".alert").removeClass("hidden").text(err.message);
          }
        });
      }
    });
  },

  "click [data-event-action=makeAdjustments]": (event, instance) => {
    event.preventDefault();
    Meteor.call("orders/makeAdjustmentsToInvoice", instance.state.get("order"));
  },

  "change input[name=refund_amount], keyup input[name=refund_amount]": (event, instance) => {
    instance.refundAmount.set(accounting.unformat(event.target.value));
  }
});


/**
 * coreOrderShippingInvoice helpers
 */
Template.coreOrderShippingInvoice.helpers({
  refundAmount() {
    return Template.instance().refundAmount;
  },

  disabled() {
    const instance = Template.instance();
    const order = instance.state.get("order");
    const status = orderCreditMethod(order).paymentMethod && orderCreditMethod(order).paymentMethod.status;

    if (status === "approved" || status === "completed") {
      return "disabled";
    }

    return "";
  },

  capturedDisabled() {
    const isLoading = Template.instance().state.get("isCapturing");
    if (isLoading) {
      return "disabled";
    }
    return null;
  }
});
