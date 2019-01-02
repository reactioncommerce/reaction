import React, { Component } from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import { Meteor } from "meteor/meteor";
import { i18next, Logger, Reaction, formatPriceString } from "/client/api";
import { Orders, Shops, Packages } from "/lib/collections";
import { getPrimaryMediaForItem } from "/lib/api";
import { composeWithTracker, registerComponent } from "@reactioncommerce/reaction-components";
import Invoice from "../components/invoice.js";
import { approvePayment, getOrderRiskStatus, getOrderRiskBadge, getShippingInfo } from "../helpers";
import { captureOrderPayments } from "../graphql";

class InvoiceContainer extends Component {
  static propTypes = {
    currency: PropTypes.object,
    order: PropTypes.object,
    uniqueItems: PropTypes.array
  }

  constructor(props) {
    super(props);
    this.state = {
      editedItems: [],
      isCapturing: false,
      isFetchingRefunds: true,
      isRefunding: false,
      isUpdating: false,
      popOverIsOpen: false,
      refunds: [],
      selectAllItems: false,
      selectedItems: [],
      value: undefined
    };
  }

  componentDidMount() {
    const { order } = this.props;

    if (order) {
      Meteor.call("orders/refunds/list", order, (error, result) => {
        if (error) Logger.warn(error);

        this.setState({
          isFetchingRefunds: false,
          refunds: Array.isArray(result) ? result.reverse() : []
        });
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
    let { editedItems, selectedItems } = this.state;

    // if item is not in the selectedItems array
    if (!selectedItems.includes(lineItem._id)) {
      // include it in the array
      selectedItems.push(lineItem._id);

      // Add every quantity in the row to be refunded
      const isEdited = editedItems.find((item) => item.id === lineItem._id);

      const adjustedQuantity = lineItem.quantity - this.state.value;

      if (isEdited) {
        editedItems = editedItems.filter((item) => item.id !== lineItem._id);
        isEdited.refundedTotal = lineItem.price.amount * adjustedQuantity;
        isEdited.refundedQuantity = adjustedQuantity;
        editedItems.push(isEdited);
      } else {
        editedItems.push({
          id: lineItem._id,
          title: lineItem.title,
          refundedTotal: lineItem.price.amount * lineItem.quantity,
          refundedQuantity: lineItem.quantity
        });
      }
    } else {
      // remove item from selected items
      selectedItems = selectedItems.filter((id) => id !== lineItem._id);

      // remove item from edited quantities
      editedItems = editedItems.filter((item) => item.id !== lineItem._id);
    }

    this.setState({
      editedItems,
      selectedItems,
      isUpdating: true,
      selectAllItems: false
    });
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
          refundedTotal: item.price.amount * item.quantity,
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
      isEdited.refundedTotal = lineItem.price.amount * refundedQuantity;
      isEdited.refundedQuantity = refundedQuantity;
      if (refundedQuantity !== 0) {
        editedItems.push(isEdited);
      }
    } else if (refundedQuantity !== 0) {
      editedItems.push({
        id: lineItem._id,
        title: lineItem.title,
        refundedTotal: lineItem.price.amount * refundedQuantity,
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
    const { order } = this.props;
    const [payment] = order.payments || [];
    const { paymentPluginName } = payment || {};
    const paymentPlugin = Packages.findOne({ name: paymentPluginName });
    return _.get(paymentPlugin, "settings.support", []).indexOf("Refund") > -1;
  }

  handleApprove = (paymentId) => {
    const { order } = this.props;
    return approvePayment(order._id, paymentId);
  }

  handleCapturePayment = (paymentId) => {
    this.setState({ isCapturing: true });

    const { order } = this.props;
    capturePayments(order, [paymentId])
      .then(() => {
        this.setState({ isCapturing: false });
        return null;
      })
      .catch((error) => {
        Logger.error(error);
        this.setState({ isCapturing: false });
      });
  }

  handleCancelOrder = () => {
    const { currency, order } = this.props;
    const [payment] = order.payments || [];
    const { amount: invoiceTotal, mode: paymentMode, paymentPluginName, status: paymentStatus } = payment || {};
    const currencySymbol = currency.symbol;

    const paymentPlugin = Packages.findOne({ name: paymentPluginName, shopId: order.shopId });

    // check if payment provider supports de-authorize
    let alertText;
    if (_.get(paymentPlugin, "settings.support", []).indexOf("De-authorize") > -1 ||
      (paymentStatus === "completed" && paymentMode === "capture")) {
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
        Meteor.call("orders/cancelOrder", order, returnToStock);
        return;
      }
      if (cancel === "cancel") {
        returnToStock = true;
        Meteor.call("orders/cancelOrder", order, returnToStock);
        return;
      }
      return;
    });
  }

  handleRefund = (paymentId, refund) => {
    const { currency, order } = this.props;
    const { refunds } = this.state;
    const currencySymbol = currency.symbol;
    const payment = order.payments.find((pmt) => pmt._id === paymentId);
    const { amount: originalPaymentTotal } = payment || {};

    const refundTotal = (refunds || []).reduce((acc, item) => acc + item.amount, 0);
    const adjustedTotal = originalPaymentTotal - refundTotal;

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
          Meteor.call("orders/refunds/create", order._id, paymentId, refund, (error, result) => {
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
    const { order } = this.props;
    const [payment] = order.payments || [];
    const { amount, mode: paymentMode } = payment || {};

    // Check if payment is yet to be captured approve and capture first before return
    if (paymentMode === "authorize") {
      Alerts.alert({
        title: i18next.t("order.refundItemsTitle"),
        type: "warning",
        text: i18next.t("order.refundItemsApproveAlert", {
          refundItemsQuantity: this.getRefundedItemsInfo().quantity,
          totalAmount: formatPriceString(amount)
        }),
        showCancelButton: true,
        confirmButtonText: i18next.t("order.approveInvoice")
      }, (isConfirm) => {
        if (isConfirm) {
          approvePayment(order._id, order.payments[0]._id)
            .then(() => this.alertToCapture(order))
            .catch((error) => {
              Logger.error(error);
            });
        }
      });
    } else {
      this.alertToRefund(order);
    }
  }

  alertToCapture = (order) => {
    if (!Array.isArray(order.payments) || order.payments.length === 0) return;

    const [payment] = order.payments;
    const { amount } = payment || {};

    Alerts.alert({
      title: i18next.t("order.refundItemsTitle"),
      text: i18next.t("order.refundItemsCaptureAlert", {
        refundItemsQuantity: this.getRefundedItemsInfo().quantity,
        totalAmount: formatPriceString(amount)
      }),
      type: "warning",
      showCancelButton: true,
      confirmButtonText: i18next.t("order.capturePayment")
    }, (isConfirm) => {
      if (isConfirm) {
        this.setState({ isCapturing: true });

        capturePayments(order)
          .then(() => {
            this.setState({ isCapturing: false });
            return this.alertToRefund(order);
          })
          .catch((error) => {
            Logger.error(error);
            this.setState({ isCapturing: false });
          });
      }
    });
  }

  alertToRefund = (order) => {
    const [payment] = order.payments || [];
    const { _id: paymentId, mode: paymentMode } = payment || {};
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
        if (paymentMode !== "capture") {
          Alerts.alert({
            text: i18next.t("order.refundItemsWait"),
            type: "warning"
          });
          this.setState({
            isRefunding: false
          });
          return;
        }

        Meteor.call("orders/refunds/refundItems", order._id, paymentId, refundInfo, (error, result) => {
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
        displayMedia={getPrimaryMediaForItem}
        getRefundedItemsInfo={this.getRefundedItemsInfo}
        handleInputChange={this.handleInputChange}
        handleItemSelect={this.handleItemSelect}
        handlePopOverOpen={this.handlePopOverOpen}
        handleRefundItems={this.handleRefundItems}
        handleSelectAllItems={this.handleSelectAllItems}
        hasRefundingEnabled={this.hasRefundingEnabled()}
        isAdjusted={this.isAdjusted}
        onApprovePayment={this.handleApprove}
        onCancelOrder={this.handleCancelOrder}
        onCapturePayment={this.handleCapturePayment}
        onRefundPayment={this.handleRefund}
        onClose={this.handleClose}
        togglePopOver={this.togglePopOver}
        toggleUpdating={this.toggleUpdating}

        value={this.state.value}
        refunds={this.state.refunds}
        isCapturing={this.state.isCapturing}
        selectAllItems={this.state.selectAllItems}
        selectedItems={this.state.selectedItems}
        isRefunding={this.state.isRefunding}
        popOverIsOpen={this.state.popOverIsOpen}
        editedItems={this.state.editedItems}
        isUpdating={this.state.isUpdating}
      />
    );
  }
}

/**
 * @method capturePayments
 * @summary helper method to capture payments
 * @param {Object} order - object representing an order
 * @param {String[]} [paymentIds] - Optional array of payment IDs, to capture certain payments
 * @return {Promise<null>} null
 * @private
 */
function capturePayments(order, paymentIds) {
  if (!order.payments) return Promise.resolve(null);

  const paymentIdList = paymentIds || order.payments.map((payment) => payment._id);
  const capture = () => captureOrderPayments({ orderId: order._id, paymentIds: paymentIdList, shopId: order.shopId });

  /**
   * @summary Show alert
   * @returns {Promise<Boolean>} Resolves if they click Continue
   */
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

  // before capturing, check if there's a payment risk on order; alert admin before capture
  if (getOrderRiskStatus(order)) {
    return alertDialog().then(capture);
  }

  return capture();
}

const composer = (props, onData) => {
  const { fulfillment, orderId } = props;

  const order = Orders.findOne({ _id: orderId });
  const shopId = Reaction.getShopId();
  const shop = Shops.findOne({ _id: shopId });
  const currency = shop && shop.currencies[shop.currency];

  if (order) {
    const [payment] = order.payments || [];
    const { status: paymentStatus } = payment || {};
    const { invoice } = getShippingInfo(order);

    // get whether adjustments can be made
    const canMakeAdjustments = !_.includes(["approved", "completed", "refunded", "partialRefund"], paymentStatus);

    // Add totalItems property to invoice
    const invoiceWithTotalItems = {
      ...invoice,
      totalItems: order.totalItemQuantity
    };

    // get discounts
    const apps = Reaction.Apps({ provides: "paymentMethod", enabled: true });
    let discounts = false;
    for (const app of apps) {
      if (app.packageName === "discount-codes") {
        discounts = true;
        break;
      }
    }

    // get unique lineItems
    const { shipmentMethod } = fulfillment || {};

    const orderItems = order.shipping.reduce((list, group) => [...list, ...group.items], []);
    const uniqueItems = orderItems.reduce((result, item) => {
      // If the items are not of this shop, skip them
      if (item.shopId === shopId) {
        item.shipping = shipmentMethod;
        result.push(item);
      }
      return result;
    }, []);

    // print order
    const printOrder = Reaction.Router.pathFor("dashboard/pdf/orders", {
      hash: {
        id: orderId,
        shipment: fulfillment && fulfillment._id
      }
    });

    onData(null, {
      canMakeAdjustments,
      currency,
      discounts,
      invoice: invoiceWithTotalItems,
      order,
      printOrder,
      uniqueItems
    });
  }
};

registerComponent("OrderInvoice", InvoiceContainer, composeWithTracker(composer));

export default composeWithTracker(composer)(InvoiceContainer);
