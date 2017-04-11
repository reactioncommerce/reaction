import accounting from "accounting-js";
import _ from "lodash";
import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { ReactiveVar } from "meteor/reactive-var";
import { i18next, Logger, formatNumber, Reaction } from "/client/api";
import { NumericInput } from "/imports/plugins/core/ui/client/components";
import { Orders, Shops } from "/lib/collections";
import { ButtonSelect } from "../../../../ui/client/components/button";
import DiscountList from "/imports/plugins/core/discounts/client/components/list";
import InvoiceContainer from "../../containers/invoiceContainer.js";
import LineItemsContainer from "../../containers/lineItemsContainer.js";
import TotalActionsContainer from "../../containers/totalActionsContainer.js";


// helper to return the order payment object
// the first credit paymentMethod on the order
// returns entire payment method
function orderCreditMethod(order) {
  return order.billing.filter(value => value.paymentMethod.method ===  "credit")[0];
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
    isFetching: true
  });

  this.autorun(() => {
    const currentData = Template.currentData();
    const order = Orders.findOne(currentData.orderId);
    const shop = Shops.findOne({});

    this.state.set("order", order);
    this.state.set("currency", shop.currencies[shop.currency]);

    if (order) {
      Meteor.call("orders/refunds/list", order, (error, result) => {
        if (!error) {
          this.refunds.set(result);
          this.state.set("isFetching", false);
        }
      });
    }
  });
});

Template.coreOrderShippingInvoice.helpers({
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
      instance.$("#btn-refund-payment").text("Refunding");
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
  DiscountList() {
    return DiscountList;
  },
  InvoiceContainer() {
    return InvoiceContainer;
  },
  buttonSelectComponent() {
    return {
      component: ButtonSelect,
      buttons: [
        {
          name: "Approve",
          i18nKeyLabel: "order.approveInvoice",
          active: true,
          status: "info",
          eventAction: "approveInvoice",
          bgColor: "bg-info",
          buttonType: "submit"
        }, {
          name: "Cancel",
          i18nKeyLabel: "order.cancelInvoice",
          active: false,
          status: "danger",
          eventAction: "cancelOrder",
          bgColor: "bg-danger",
          buttonType: "button"
        }
      ]
    };
  },
  LineItemsContainer() {
    return LineItemsContainer;
  },
  TotalActionsContainer() {
    return TotalActionsContainer;
  },
  orderId() {
    const instance = Template.instance();
    const state = instance.state;
    const order = state.get("order");
    return order._id;
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
    const invoiceTotal = order.billing[0].invoice.total;
    const currencySymbol = instance.state.get("currency").symbol;

    Alerts.alert({
      title: i18next.t("order.cancelOrder"),
      text: i18next.t("order.applyRefundDuringCancelOrder", { currencySymbol, invoiceTotal }),
      type: "warning",
      showCancelButton: true,
      showCloseButton: true,
      confirmButtonColor: "#98afbc",
      cancelButtonColor: "#98afbc",
      confirmButtonText: i18next.t("order.cancelOrderNoRestock"),
      cancelButtonText: i18next.t("order.cancelOrderThenRestock")
    }, (isConfirm, cancel)=> {
      let returnToStock;
      if (isConfirm) {
        returnToStock = false;
        return Meteor.call("orders/cancelOrder", order, returnToStock, err => {
          if (err) Logger.warn(err);
        });
      }
      if (cancel === "cancel") {
        returnToStock = true;
        return Meteor.call("orders/cancelOrder", order, returnToStock, err => {
          if (err) Logger.warn(err);
        });
      }
    });
  },
  /**
   * Submit form
   * @param  {Event} event - Event object
   * @param  {Template} instance - Blaze Template
   * @return {void}
   */
  "submit form[name=capture]": (event, instance) => {
    event.preventDefault();
    const state = instance.state;
    const order = state.get("order");

    const paymentMethod = orderCreditMethod(order);
    const orderTotal = accounting.toFixed(
      paymentMethod.invoice.subtotal
      + paymentMethod.invoice.shipping
      + paymentMethod.invoice.taxes
      , 2);

    const discount = state.get("field-discount") || order.discount;
    // TODO: review Discount cannot be greater than original total price
    // logic is probably not valid any more. Discounts aren't valid below 0 order.
    if (discount > orderTotal) {
      Alerts.inline("Discount cannot be greater than original total price", "error", {
        placement: "coreOrderShippingInvoice",
        i18nKey: "order.invalidDiscount",
        autoHide: 10000
      });
    } else if (orderTotal === accounting.toFixed(discount, 2)) {
      Alerts.alert({
        title: i18next.t("order.fullDiscountWarning"),
        showCancelButton: true,
        confirmButtonText: i18next.t("order.applyDiscount")
      }, (isConfirm) => {
        if (isConfirm) {
          Meteor.call("orders/approvePayment", order, (error) => {
            if (error) {
              Logger.warn(error);
            }
          });
        }
      });
    } else {
      Meteor.call("orders/approvePayment", order, (error) => {
        if (error) {
          Logger.warn(error);
          if (error.error === "orders/approvePayment.discount-amount") {
            Alerts.inline("Discount cannot be greater than original total price", "error", {
              placement: "coreOrderShippingInvoice",
              i18nKey: "order.invalidDiscount",
              autoHide: 10000
            });
          }
        }
      });
    }
  },

  /**
   * Submit form
   * @param  {Event} event - Event object
   * @param  {Template} instance - Blaze Template
   * @return {void}
   */
  "click [data-event-action=applyRefund]": (event, instance) => {
    event.preventDefault();

    const { state } = Template.instance();
    const currencySymbol = state.get("currency").symbol;
    const order = instance.state.get("order");
    const paymentMethod = orderCreditMethod(order).paymentMethod;
    const orderTotal = paymentMethod.amount;
    const discounts = paymentMethod.discounts;
    const refund = state.get("field-refund") || 0;
    const refunds = Template.instance().refunds.get();
    let refundTotal = 0;
    _.each(refunds, function (item) {
      refundTotal += parseFloat(item.amount);
    });

    let adjustedTotal;

    // TODO extract Stripe specific fullfilment payment handling out of core.
    // Stripe counts discounts as refunds, so we need to re-add the discount to not "double discount" in the adjustedTotal
    if (paymentMethod.processor === "Stripe") {
      adjustedTotal = accounting.toFixed(orderTotal + discounts - refundTotal, 2);
    } else {
      adjustedTotal = accounting.toFixed(orderTotal - refundTotal, 2);
    }

    if (refund > adjustedTotal) {
      Alerts.inline("Refund(s) total cannot be greater than adjusted total", "error", {
        placement: "coreOrderRefund",
        i18nKey: "order.invalidRefund",
        autoHide: 10000
      });
    } else {
      Alerts.alert({
        title: i18next.t("order.applyRefundToThisOrder", { refund: refund, currencySymbol: currencySymbol }),
        showCancelButton: true,
        confirmButtonText: i18next.t("order.applyRefund")
      }, (isConfirm) => {
        if (isConfirm) {
          state.set("isRefunding", true);
          Meteor.call("orders/refunds/create", order._id, paymentMethod, refund, (error) => {
            if (error) {
              Alerts.alert(error.reason);
            }
            Alerts.toast(i18next.t("mail.alerts.emailSent"), "success");
            state.set("field-refund", 0);
            state.set("isRefunding", false);
          });
        }
      });
    }
  },

  "click [data-event-action=makeAdjustments]": (event, instance) => {
    event.preventDefault();
    Meteor.call("orders/makeAdjustmentsToInvoice", instance.state.get("order"));
  },

  "click [data-event-action=capturePayment]": (event, instance) => {
    event.preventDefault();

    instance.state.set("isCapturing", true);

    const order = instance.state.get("order");
    Meteor.call("orders/capturePayments", order._id);

    if (order.workflow.status === "new") {
      Meteor.call("workflow/pushOrderWorkflow", "coreOrderWorkflow", "processing", order);

      Reaction.Router.setQueryParams({
        filter: "processing",
        _id: order._id
      });
    }
  },

  "change input[name=refund_amount], keyup input[name=refund_amount]": (event, instance) => {
    instance.refundAmount.set(accounting.unformat(event.target.value));
  }
});


/**
 * coreOrderShippingInvoice helpers
 */
Template.coreOrderShippingInvoice.helpers({
  NumericInput() {
    return NumericInput;
  },

  numericInputProps(fieldName, value = 0, enabled = true) {
    const { state } = Template.instance();
    const order = state.get("order");
    const paymentMethod = orderCreditMethod(order);
    const status = paymentMethod.status;
    const isApprovedAmount = (status === "approved" || status === "completed");

    return {
      component: NumericInput,
      numericType: "currency",
      value: value,
      disabled: !enabled,
      isEditing: !isApprovedAmount, // Dont allow editing if its approved
      format: state.get("currency"),
      classNames: {
        input: { amount: true },
        text: {
          "text-success": status === "completed"
        }
      },
      onChange(event, data) {
        state.set(`field-${fieldName}`, data.numberValue);
      }
    };
  },

  refundInputProps() {
    const { state } = Template.instance();
    const order = state.get("order");
    const paymentMethod = orderCreditMethod(order).paymentMethod;
    const refunds = Template.instance().refunds.get();

    let refundTotal = 0;
    _.each(refunds, function (item) {
      refundTotal += parseFloat(item.amount);
    });
    const adjustedTotal = paymentMethod.amount - refundTotal;

    return {
      component: NumericInput,
      numericType: "currency",
      value: 0,
      maxValue: adjustedTotal,
      format: state.get("currency"),
      classNames: {
        input: { amount: true }
      },
      onChange(event, data) {
        state.set("field-refund", data.numberValue);
      }
    };
  },

  refundAmount() {
    return Template.instance().refundAmount;
  },
  /**
   * Discount
   * @return {Number} current discount amount
   */
  invoice() {
    const instance = Template.instance();
    const order = instance.state.get("order");

    const invoice = Object.assign({}, order.billing[0].invoice, {
      totalItems: order.items.length
    });
    return invoice;
  },

  money(amount) {
    return formatNumber(amount);
  },

  disabled() {
    const instance = Template.instance();
    const order = instance.state.get("order");
    const status = orderCreditMethod(order).paymentMethod.status;

    if (status === "approved" || status === "completed") {
      return "disabled";
    }

    return "";
  },

  paymentPendingApproval() {
    const instance = Template.instance();
    const order = instance.state.get("order");
    const status = orderCreditMethod(order).paymentMethod.status;

    return status === "created" || status === "adjustments" || status === "error";
  },

  canMakeAdjustments() {
    const instance = Template.instance();
    const order = instance.state.get("order");
    const status = orderCreditMethod(order).paymentMethod.status;

    if (status === "approved" || status === "completed") {
      return false;
    }
    return true;
  },

  showAfterPaymentCaptured() {
    const instance = Template.instance();
    const order = instance.state.get("order");
    const orderStatus = orderCreditMethod(order).paymentMethod.status;
    return orderStatus === "completed";
  },

  paymentApproved() {
    const instance = Template.instance();
    const order = instance.state.get("order");

    return order.billing[0].paymentMethod.status === "approved";
  },

  paymentCaptured() {
    const instance = Template.instance();
    const order = instance.state.get("order");
    const orderStatus = orderCreditMethod(order).paymentMethod.status;
    const orderMode = orderCreditMethod(order).paymentMethod.mode;
    return orderStatus === "completed" || (orderStatus === "refunded" && orderMode === "capture");
  },

  paymentCanceled() {
    const instance = Template.instance();
    const order = instance.state.get("order");
    const orderMode = orderCreditMethod(order).paymentMethod.mode;
    return orderMode === "cancel";
  },

  refundTransactions() {
    const instance = Template.instance();
    const order = instance.state.get("order");
    const transactions = orderCreditMethod(order).paymentMethod.transactions;

    return _.filter(transactions, (transaction) => {
      return transaction.type === "refund";
    });
  },

  refunds() {
    const refunds = Template.instance().refunds.get();
    if (_.isArray(refunds)) {
      return refunds.reverse();
    }

    return false;
  },

  /**
   * Get the total after all refunds
   * @return {Number} the amount after all refunds
   */
  adjustedTotal() {
    const instance = Template.instance();
    const order = instance.state.get("order");
    const paymentMethod = orderCreditMethod(order).paymentMethod;
    const discounts = orderCreditMethod(order).invoice.discounts;
    const refunds = Template.instance().refunds.get();
    let refundTotal = 0;

    _.each(refunds, function (item) {
      refundTotal += parseFloat(item.amount);
    });

    if (paymentMethod.processor === "Stripe") {
      return Math.abs(paymentMethod.amount + discounts - refundTotal);
    }
    return Math.abs(paymentMethod.amount - refundTotal);
  },

  capturedDisabled() {
    const isLoading = Template.instance().state.get("isCapturing");
    if (isLoading) {
      return "disabled";
    }
    return null;
  },

  refundSubmitDisabled() {
    const amount = Template.instance().state.get("field-refund") || 0;
    const isLoading = Template.instance().state.get("isRefunding");
    if (amount === 0 || isLoading) {
      return "disabled";
    }

    return null;
  },

  /**
   * Order
   * @summary find a single order using the order id spplied with the template
   * data context
   * @return {Object} A single order
   */
  order() {
    const instance = Template.instance();
    const order = instance.state.get("order");

    return order;
  },

  shipment() {
    const instance = Template.instance();
    const order = instance.state.get("order");

    const shipment = _.filter(order.shipping, { _id: currentData.fulfillment._id })[0];

    return shipment;
  },

  discounts() {
    const enabledPaymentsArr = [];
    const apps = Reaction.Apps({
      provides: "paymentMethod",
      enabled: true
    });
    for (app of apps) {
      if (app.enabled === true) enabledPaymentsArr.push(app);
    }
    let discount = false;

    for (enabled of enabledPaymentsArr) {
      if (enabled.packageName === "discount-codes") {
        discount = true;
        break;
      }
    }
    return discount;
  },

  items() {
    const instance = Template.instance();
    const order = instance.state.get("order");
    const currentData = Template.currentData();
    const shipment = currentData.fulfillment;

    // returns array of individual items that have been checked out
    const returnItems = _.map(shipment.items, (item) => {
      const originalItem = _.find(order.items, {
        _id: item._id
      });
      return _.extend(originalItem, item);
    });

    let items;


    // if avalara tax has been enabled it adds a "taxDetail" field for every item
    if (order.taxes !== undefined) {
      const taxes = order.taxes.slice(0, -1);

      items = _.map(returnItems, (item) => {
        const taxDetail = _.find(taxes, {
          lineNumber: item.cartItemId
        });
        return _.extend(item, { taxDetail });
      });
    } else {
      items = returnItems;
    }

    /**
     * It goes through individual items and groups similar items using the cartItemId.
     * The output is an object whose keys are cartItemId and every item with the same
     * cartItemId is added as a value
     */
    let uniqueItems = items.reduce((carts, item) => {
      let cart;

      if (carts[item.cartItemId]) {
        cart = carts[item.cartItemId];
        cart = Object.assign({}, cart, {
          items: [...cart.items, item]
        });
      } else {
        cart = {
          cartItemId: item.cartItemId,
          productId: item.productId,
          shippingRate: shipment.shipmentMethod.rate,
          items: [item]
        };
      }

      carts[item.cartItemId] = cart;
      return carts;
    }, {});

    // Converts the uniqueItems object to an array
    uniqueItems = Object.keys(uniqueItems).map(k => uniqueItems[k]);

    return uniqueItems;
  }
});
