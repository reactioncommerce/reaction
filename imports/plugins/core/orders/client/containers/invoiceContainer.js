import React, { Component } from "react";
import PropTypes from "prop-types";
import accounting from "accounting-js";
import _ from "lodash";
import { Meteor } from "meteor/meteor";
import { i18next, Logger, Reaction, formatPriceString } from "/client/api";
import { Packages } from "/lib/collections";
import { getPrimaryMediaForOrderItem } from "/lib/api";
import { composeWithTracker, registerComponent } from "@reactioncommerce/reaction-components";
import Invoice from "../components/invoice.js";
import { getOrderRiskStatus, getOrderRiskBadge, getBillingInfo } from "../helpers";

class InvoiceContainer extends Component {
  static propTypes = {
    currency: PropTypes.object,
    isFetching: PropTypes.bool,
    order: PropTypes.object,
    refunds: PropTypes.array,
    uniqueItems: PropTypes.array
  }

  constructor(props) {
    super(props);
    this.state = {
      currency: props.currency,
      refunds: props.refunds,
      order: props.order,
      isUpdating: false,
      isCapturing: false,
      isRefunding: false,
      popOverIsOpen: false,
      selectAllItems: false,
      selectedItems: [],
      editedItems: [],
      value: undefined
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps !== this.props) {
      this.setState({
        order: nextProps.order,
        currency: nextProps.currency,
        refunds: nextProps.refunds
      });
    }
  }

  handlePopOverOpen = (event) => {
    event.preventDefault();
    this.setState({
      popOverIsOpen: true
    });
  }

  handleClearRefunds = () => {
    this.setState({
      editedItems: [],
      selectedItems: [],
      selectAllItems: false,
      popOverIsOpen: false
    });
  };

  handleItemSelect = (lineItem) => {
    let { selectedItems, editedItems } = this.state;

    // if item is not in the selectedItems array
    if (!selectedItems.includes(lineItem._id)) {
      // include it in the array
      selectedItems.push(lineItem._id);

      // Add every quantity in the row to be refunded
      const isEdited = editedItems.find((item) => item.id === lineItem._id);

      const adjustedQuantity = lineItem.quantity - this.state.value;

      if (isEdited) {
        editedItems = editedItems.filter((item) => item.id !== lineItem._id);
        isEdited.refundedTotal = lineItem.variants.price * adjustedQuantity;
        isEdited.refundedQuantity = adjustedQuantity;
        editedItems.push(isEdited);
      } else {
        editedItems.push({
          id: lineItem._id,
          title: lineItem.title,
          refundedTotal: lineItem.variants.price * lineItem.quantity,
          refundedQuantity: lineItem.quantity
        });
      }

      this.setState({
        editedItems,
        selectedItems,
        isUpdating: true,
        selectAllItems: false
      });
    } else {
      // remove item from selected items
      selectedItems = selectedItems.filter((id) => id !== lineItem._id);

      // remove item from edited quantities
      editedItems = editedItems.filter((item) => item.id !== lineItem._id);

      this.setState({
        editedItems,
        selectedItems,
        isUpdating: true,
        selectAllItems: false
      });
    }
  }

  handleSelectAllItems = (uniqueItems) => {
    if (this.state.selectAllItems) {
      // if all items are selected, clear the selectedItems array
      // and set selectAllItems to false
      this.setState({
        selectedItems: [],
        editedItems: [],
        selectAllItems: false
      });
    } else {
      // if there are no selected items, or if there are some items that have been
      // selected but not all of them, loop through the items array and return a
      // new array with item ids only, then set the selectedItems array with the itemIds
      const updateEditedItems = [];

      const itemIds = uniqueItems.map((item) => {
        // on select all refunded quantity should be all existing items
        updateEditedItems.push({
          id: item._id,
          title: item.title,
          refundedTotal: item.variants.price * item.quantity,
          refundedQuantity: item.quantity
        });
        return item._id;
      });
      this.setState({
        editedItems: updateEditedItems,
        selectedItems: itemIds,
        selectAllItems: true,
        isUpdating: true
      });
    }
  }

  handleInputChange = (event, value, lineItem) => {
    let { editedItems } = this.state;

    const isEdited = editedItems.find((item) => item.id === lineItem._id);

    const refundedQuantity = lineItem.quantity - value;

    if (isEdited) {
      editedItems = editedItems.filter((item) => item.id !== lineItem._id);
      isEdited.refundedTotal = lineItem.variants.price * refundedQuantity;
      isEdited.refundedQuantity = refundedQuantity;
      if (refundedQuantity !== 0) {
        editedItems.push(isEdited);
      }
    } else if (refundedQuantity !== 0) {
      editedItems.push({
        id: lineItem._id,
        title: lineItem.title,
        refundedTotal: lineItem.variants.price * refundedQuantity,
        refundedQuantity
      });
    }
    this.setState({
      editedItems,
      value
    });
  }

  getRefundedItemsInfo = () => {
    const { editedItems } = this.state;
    return {
      quantity: editedItems.reduce((acc, item) => acc + item.refundedQuantity, 0),
      total: editedItems.reduce((acc, item) => acc + item.refundedTotal, 0),
      items: editedItems
    };
  }

  hasRefundingEnabled() {
    const { order } = this.state;
    const orderBillingInfo = getBillingInfo(order);
    const paymentMethodId = orderBillingInfo.paymentMethod && orderBillingInfo.paymentMethod.paymentPackageId;
    const paymentMethodName = orderBillingInfo.paymentMethod && orderBillingInfo.paymentMethod.paymentSettingsKey;
    const paymentMethod = Packages.findOne({ _id: paymentMethodId });
    const isRefundable = paymentMethod && paymentMethod.settings && paymentMethod.settings[paymentMethodName]
      && paymentMethod.settings[paymentMethodName].support.includes("Refund");

    return isRefundable;
  }

  handleApprove = (event) => {
    event.preventDefault();

    const { order } = this.state;
    approvePayment(order);
  }

  handleCapturePayment = (event) => {
    event.preventDefault();

    this.setState({
      isCapturing: true
    });

    const { order } = this.state;
    capturePayments(order, () => {
      this.setState({
        isCapturing: false
      });
    });
  }

  handleCancelPayment = (event) => {
    event.preventDefault();
    const { order } = this.state;
    const invoiceTotal = getBillingInfo(order).invoice && getBillingInfo(order).invoice.total;
    const currencySymbol = this.state.currency.symbol;

    Meteor.subscribe("Packages", Reaction.getShopId());
    const packageId = getBillingInfo(order).paymentMethod && getBillingInfo(order).paymentMethod.paymentPackageId;
    const settingsKey = getBillingInfo(order).paymentMethod && getBillingInfo(order).paymentMethod.paymentSettingsKey;
    // check if payment provider supports de-authorize
    const checkSupportedMethods = Packages.findOne({
      _id: packageId,
      shopId: Reaction.getShopId()
    }).settings[settingsKey].support;

    const orderStatus = getBillingInfo(order).paymentMethod && getBillingInfo(order).paymentMethod.status;
    const orderMode = getBillingInfo(order).paymentMethod && getBillingInfo(order).paymentMethod.mode;

    let alertText;
    if (_.includes(checkSupportedMethods, "de-authorize") ||
      (orderStatus === "completed" && orderMode === "capture")) {
      alertText = i18next.t("order.applyRefundDuringCancelOrder", { currencySymbol, invoiceTotal });
    }

    // TODO: Redesign the cancel order workflow to be more intuitive
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
        return Meteor.call("orders/cancelOrder", order, returnToStock);
      }
      if (cancel === "cancel") {
        returnToStock = true;
        return Meteor.call("orders/cancelOrder", order, returnToStock);
      }
    });
  }

  handleRefund = (event, value) => {
    event.preventDefault();

    const currencySymbol = this.state.currency.symbol;
    const { order } = this.state;
    const paymentMethod = orderCreditMethod(order) && orderCreditMethod(order).paymentMethod;
    const orderTotal = paymentMethod && paymentMethod.amount;
    const discounts = paymentMethod && paymentMethod.discounts;
    const refund = value;
    const { refunds } = this.state;
    const refundTotal = refunds && Array.isArray(refunds) && refunds.reduce((acc, item) => acc + parseFloat(item.amount), 0);

    let adjustedTotal;

    // TODO extract Stripe specific fullfilment payment handling out of core.
    // Stripe counts discounts as refunds, so we need to re-add the discount to not "double discount" in the adjustedTotal
    if (paymentMethod && paymentMethod.processor === "Stripe") {
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
        title: i18next.t("order.applyRefundToThisOrder", { refund, currencySymbol }),
        showCancelButton: true,
        confirmButtonText: i18next.t("order.applyRefund")
      }, (isConfirm) => {
        if (isConfirm) {
          this.setState({
            isRefunding: true
          });
          Meteor.call("orders/refunds/create", order._id, paymentMethod, refund, (error, result) => {
            if (error) {
              Alerts.alert(error.reason);
            }
            if (result) {
              Alerts.toast(i18next.t("mail.alerts.emailSent"), "success");
            }
            this.setState({
              isRefunding: false
            });
          });
        }
      });
    }
  }

  handleRefundItems = () => {
    const paymentMethod = orderCreditMethod(this.state.order) && orderCreditMethod(this.state.order).paymentMethod;
    const orderMode = paymentMethod && paymentMethod.mode;
    const { order } = this.state;

    // Check if payment is yet to be captured approve and capture first before return
    if (orderMode === "authorize") {
      Alerts.alert({
        title: i18next.t("order.refundItemsTitle"),
        type: "warning",
        text: i18next.t("order.refundItemsApproveAlert", {
          refundItemsQuantity: this.getRefundedItemsInfo().quantity,
          totalAmount: formatPriceString(getBillingInfo(order).invoice && getBillingInfo(order).invoice.total)
        }),
        showCancelButton: true,
        confirmButtonText: i18next.t("order.approveInvoice")
      }, (isConfirm) => {
        if (isConfirm) {
          approvePayment(order);
          this.alertToCapture(order);
        }
      });
    } else {
      this.alertToRefund(order);
    }
  }

  alertToCapture = (order) => {
    Alerts.alert({
      title: i18next.t("order.refundItemsTitle"),
      text: i18next.t("order.refundItemsCaptureAlert", {
        refundItemsQuantity: this.getRefundedItemsInfo().quantity,
        totalAmount: formatPriceString(getBillingInfo(order).invoice && getBillingInfo(order).invoice.total)
      }),
      type: "warning",
      showCancelButton: true,
      confirmButtonText: i18next.t("order.capturePayment")
    }, (isConfirm) => {
      if (isConfirm) {
        capturePayments(order);
        this.alertToRefund(order);
      }
    });
  }

  alertToRefund = (order) => {
    const paymentMethod = orderCreditMethod(order) && orderCreditMethod(order).paymentMethod;
    const orderMode = paymentMethod && paymentMethod.mode;
    const refundInfo = this.getRefundedItemsInfo();

    Alerts.alert({
      title: i18next.t("order.refundItemsTitle"),
      text: i18next.t("order.refundItemsAlert", {
        refundItemsQuantity: refundInfo.quantity,
        refundItemsTotal: formatPriceString(refundInfo.total)
      }),
      showCancelButton: true,
      confirmButtonText: i18next.t("order.refundAmount")
    }, (isConfirm) => {
      if (isConfirm) {
        this.setState({
          isRefunding: true
        });

        // Set warning if order is not yet captured
        if (orderMode !== "capture") {
          Alerts.alert({
            text: i18next.t("order.refundItemsWait"),
            type: "warning"
          });
          this.setState({
            isRefunding: false
          });
          return;
        }

        Meteor.call("orders/refunds/refundItems", this.state.order._id, paymentMethod, refundInfo, (error, result) => {
          if (result.refund === false) {
            Alerts.alert(result.error.reason || result.error.error);
          }
          if (result.refund === true) {
            Alerts.toast(i18next.t("mail.alerts.emailSent"), "success");

            Alerts.alert({
              text: i18next.t("order.refundItemsSuccess"),
              type: "success",
              allowOutsideClick: false
            });
          }

          this.setState({
            isRefunding: false,
            popOverIsOpen: false,
            editedItems: [],
            selectedItems: []
          });
        });
      }
    });
  }

  render() {
    return (
      <Invoice
        {...this.props}

        clearRefunds={this.handleClearRefunds}
        handlePopOverOpen={this.handlePopOverOpen}
        handleSelectAllItems={this.handleSelectAllItems}
        onClose={this.handleClose}
        togglePopOver={this.togglePopOver}
        handleInputChange={this.handleInputChange}
        handleItemSelect={this.handleItemSelect}
        displayMedia={getPrimaryMediaForOrderItem}
        toggleUpdating={this.toggleUpdating}
        handleRefundItems={this.handleRefundItems}
        getRefundedItemsInfo={this.getRefundedItemsInfo}
        handleApprove={this.handleApprove}
        isAdjusted={this.isAdjusted}
        handleCapturePayment={this.handleCapturePayment}
        handleRefund={this.handleRefund}
        hasRefundingEnabled={this.hasRefundingEnabled()}

        value={this.state.value}
        refunds={this.state.refunds}
        isCapturing={this.state.isCapturing}
        selectAllItems={this.state.selectAllItems}
        selectedItems={this.state.selectedItems}
        currency={this.state.currency}
        isRefunding={this.state.isRefunding}
        popOverIsOpen={this.state.popOverIsOpen}
        editedItems={this.state.editedItems}
        isUpdating={this.state.isUpdating}
      />
    );
  }
}

/**
 * @method orderCreditMethod
 * @summary helper method to return the order payment object
 * @param {Object} order - object representing an order
 * @return {Object} object representing entire payment method
 */
function orderCreditMethod(order) {
  const billingInfo = getBillingInfo(order);

  if (billingInfo.paymentMethod && billingInfo.paymentMethod.method === "credit") {
    return billingInfo;
  }
}

/**
 * @method approvePayment
 * @summary helper method to approve payment
 * @param {Object} order - object representing an order
 * @return {null} null
 */
function approvePayment(order) {
  const paymentMethod = orderCreditMethod(order);
  const orderTotal = accounting.toFixed(
    paymentMethod.invoice.subtotal
    + paymentMethod.invoice.shipping
    + paymentMethod.invoice.taxes
    , 2
  );

  const { discount } = order;
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
}

/**
 * @method capturePayments
 * @summary helper method to capture payments
 * @param {object} order - object representing an order
 * @param {function} onCancel - called on clicking cancel in alert dialog
 * @return {null} null
 */
function capturePayments(order, onCancel) {
  const capture = () => {
    Meteor.call("orders/capturePayments", order._id);
    if (order.workflow.status === "new") {
      Meteor.call("workflow/pushOrderWorkflow", "coreOrderWorkflow", "processing", order);

      Reaction.Router.setQueryParams({
        filter: "processing",
        _id: order._id
      });
    }
  };

  // before capturing, check if there's a payment risk on order; alert admin before capture
  if (getOrderRiskStatus(order)) {
    alertDialog()
      .then(capture)
      .catch(onCancel);
  } else {
    capture();
  }

  function alertDialog() {
    let alertType = "warning";
    const riskBadge = getOrderRiskBadge(getOrderRiskStatus(order));
    // use red alert color for high risk level
    if (riskBadge === "danger") {
      alertType = "error";
    }

    return Alerts.alert({
      title: i18next.t("admin.orderRisk.riskCapture"),
      text: i18next.t("admin.orderRisk.riskCaptureWarn"),
      type: alertType,
      showCancelButton: true,
      cancelButtonText: i18next.t("admin.settings.cancel"),
      confirmButtonText: i18next.t("admin.settings.continue")
    });
  }
}

const composer = (props, onData) => {
  const { order, refunds } = props;

  const shopBilling = getBillingInfo(order);
  const creditMethod = orderCreditMethod(order);

  const paymentMethod = creditMethod && creditMethod.paymentMethod;
  const orderStatus = creditMethod && creditMethod.paymentMethod && creditMethod.paymentMethod.status;
  const orderDiscounts = creditMethod && creditMethod.invoice.discounts;

  const paymentApproved = orderStatus === "approved";
  const showAfterPaymentCaptured = orderStatus === "completed";
  const paymentCaptured = _.includes(["completed", "refunded", "partialRefund"], orderStatus);
  const paymentPendingApproval = _.includes(["created", "adjustments", "error"], orderStatus);

  // get whether adjustments can be made
  const canMakeAdjustments = !_.includes(["approved", "completed", "refunded", "partialRefund"], orderStatus);

  // get adjusted Total
  let adjustedTotal;
  const refundTotal = refunds && Array.isArray(refunds) && refunds.reduce((acc, item) => acc + parseFloat(item.amount), 0);

  if (paymentMethod && paymentMethod.processor === "Stripe") {
    adjustedTotal = Math.abs(paymentMethod.amount + orderDiscounts - refundTotal);
  }
  adjustedTotal = Math.abs(paymentMethod && paymentMethod.amount - refundTotal);

  // get invoice
  const invoice = Object.assign({}, shopBilling.invoice, {
    totalItems: _.sumBy(order.items, (o) => o.quantity)
  });

  // get discounts
  const enabledPaymentsArr = [];
  const apps = Reaction.Apps({
    provides: "paymentMethod",
    enabled: true
  });
  for (const app of apps) {
    if (app.enabled === true) enabledPaymentsArr.push(app);
  }
  let discounts = false;

  for (const enabled of enabledPaymentsArr) {
    if (enabled.packageName === "discount-codes") {
      discounts = true;
      break;
    }
  }

  // get unique lineItems
  const shipment = props.currentData.fulfillment;

  const uniqueItems = order.items.map((item) => {
    const shipping = shipment && shipment.shipmentMethod;
    item.shipping = shipping;
    if (order.taxes !== undefined) {
      const taxes = order.taxes.slice(0, -1);

      if (taxes.length !== 0) {
        const taxDetail = taxes.find((tax) => tax.lineNumber === item._id);
        item.taxDetail = taxDetail;
      }
    }
    return item;
  });

  // print order
  const printOrder = Reaction.Router.pathFor("dashboard/pdf/orders", {
    hash: {
      id: props.order._id,
      shipment: props.currentData.fulfillment && props.currentData.fulfillment._id
    }
  });

  onData(null, {
    uniqueItems,
    invoice,
    discounts,
    adjustedTotal,
    paymentCaptured,
    paymentPendingApproval,
    paymentApproved,
    canMakeAdjustments,
    showAfterPaymentCaptured,
    printOrder,

    currentData: props.currentData,
    currency: props.currency,
    isFetching: props.isFetching,
    order: props.order,
    refunds: props.refunds
  });
};

registerComponent("InvoiceContainer", InvoiceContainer, composeWithTracker(composer));

export default composeWithTracker(composer)(InvoiceContainer);
