import React, { Component } from "react";
import PropTypes from "prop-types";
import { Meteor } from "meteor/meteor";
import accounting from "accounting-js";
import _ from "lodash";
import { i18next, Logger, Reaction } from "/client/api";
import { Media, Packages } from "/lib/collections";
import { composeWithTracker } from "@reactioncommerce/reaction-components";
import { TranslationProvider } from "/imports/plugins/core/ui/client/providers";
import Invoice from "../components/invoice.js";


class InvoiceContainer extends Component {
  static propTypes = {
    currency: PropTypes.object,
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
      isOpen: false,
      isUpdating: false,
      isCapturing: false,
      isFetching: true,
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

  handleClick = (event) => {
    event.preventDefault();
    this.setState({
      isOpen: true
    });
  }

  handleItemSelect = (lineItem) => {
    let { selectedItems, editedItems } = this.state;

    // if item is not in the selectedItems array
    if (!selectedItems.includes(lineItem._id)) {
      // include it in the array
      selectedItems.push(lineItem._id);

      // Add every quantity in the row to be refunded
      const isEdited = editedItems.find(item => {
        return item.id === lineItem._id;
      });

      const adjustedQuantity = lineItem.quantity - this.state.value;

      if (isEdited) {
        editedItems = editedItems.filter(item => item.id !== lineItem._id);
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
      selectedItems = selectedItems.filter((id) => {
        if (id !== lineItem._id) {
          return id;
        }
      });
      // remove item from edited quantities
      editedItems = editedItems.filter(item => item.id !== lineItem._id);

      this.setState({
        editedItems,
        selectedItems,
        isUpdating: true,
        selectAllItems: false
      });
    }
  }

  handleSelectAllItems = (uniqueItems) => {
    let editedItems = this.state.editedItems;

    if (this.state.selectAllItems) {
      // if all items are selected, clear the selectedItems array
      // and set selectAllItems to false
      this.setState({
        selectedItems: [],
        selectAllItems: false
      });
    } else {
      // if there are no selected items, or if there are some items that have been
      // selected but not all of them, loop through the items array and return a
      // new array with item ids only, then set the selectedItems array with the itemIds
      const itemIds = uniqueItems.map((item) => {
        const isEdited = editedItems.find(editedItem => {
          return editedItem.id === item._id;
        });

        const adjustedQuantity = item.quantity - this.state.value;

        if (isEdited) {
          // if the line item was changed onSelect keep the refunded quantity that had been previously input
          editedItems = editedItems.filter(editedItem => editedItem.id !== item._id);
          isEdited.refundedTotal = item.variants.price * adjustedQuantity;
          isEdited.refundedQuantity = adjustedQuantity;
          editedItems.push(isEdited);
        } else {
          // if the line item wasn't changed on select the refunded quantity should be all existing items
          editedItems.push({
            id: item._id,
            title: item.title,
            refundedTotal: item.variants.price * item.quantity,
            refundedQuantity: item.quantity
          });
        }
        return item._id;
      });
      this.setState({
        editedItems,
        selectedItems: itemIds,
        selectAllItems: true,
        isUpdating: true
      });
    }
  }

  handleInputChange = (event, value, lineItem) => {
    let { editedItems } = this.state;

    const isEdited = editedItems.find(item => {
      return item.id === lineItem._id;
    });

    const refundedQuantity = lineItem.quantity - value;

    if (isEdited) {
      editedItems = editedItems.filter(item => item.id !== lineItem._id);
      isEdited.refundedTotal = lineItem.variants.price * refundedQuantity;
      isEdited.refundedQuantity = refundedQuantity;
      editedItems.push(isEdited);
    } else {
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

  /**
   * Media - find media based on a product/variant
   * @param  {Object} item object containing a product and variant id
   * @return {Object|false} An object contianing the media or false
   */
  handleDisplayMedia = (item) => {
    const variantId = item.variants._id;
    const productId = item.productId;

    const variantImage = Media.findOne({
      "metadata.variantId": variantId,
      "metadata.productId": productId
    });

    if (variantImage) {
      return variantImage;
    }

    const defaultImage = Media.findOne({
      "metadata.productId": productId,
      "metadata.priority": 0
    });

    if (defaultImage) {
      return defaultImage;
    }
    return false;
  }

  handleReturnItems = () => {
    const paymentMethod = orderCreditMethod(this.state.order).paymentMethod;
    const editedItems = this.state.editedItems;

    Alerts.alert({
      title: "Return selected Items",
      showCancelButton: true,
      confirmButtonText: i18next.t("order.applyRefund")
    }, (isConfirm) => {
      if (isConfirm) {
        this.setState({
          isRefunding: true
        });

        Meteor.call("orders/refunds/returnItems", this.state.order._id, paymentMethod, editedItems, this.getSelectedItemsInfo(), (error) => {
          if (error) {
            Alerts.alert(error.reason);
          }
          Alerts.toast(i18next.t("mail.alerts.emailSent"), "success");
          this.setState({
            isRefunding: false
          });
        });
      }
    });
  }

  getRefundedItemsInfo = () => {
    const { editedItems } = this.state;
    return {
      quantity: editedItems.reduce((acc, item) => acc + item.refundedQuantity, 0),
      total: editedItems.reduce((acc, item) => acc + item.refundedTotal, 0)
    };
  }

  getSelectedItemsInfo = () => {
    const { editedItems } = this.state;
    const quantity = editedItems.reduce((acc, item) => {
      let calcQuantity;
      if (this.state.selectedItems.includes(item.id)) {
        calcQuantity = acc + item.refundedQuantity;
      } else {
        calcQuantity = acc;
      }
      return calcQuantity;
    }, 0);

    const total = editedItems.reduce((acc, item) => {
      let calcTotal;
      if (this.state.selectedItems.includes(item.id)) {
        calcTotal = acc + item.refundedTotal;
      } else {
        calcTotal = acc;
      }
      return calcTotal;
    }, 0);

    return { quantity, total };
  }

  handleCancelPayment = (event) => {
    event.preventDefault();
    const order = this.state.order;
    const invoiceTotal = order.billing[0].invoice.total;
    const currencySymbol = this.state.currency.symbol;

    Meteor.subscribe("Packages", Reaction.getShopId());
    const packageId = order.billing[0].paymentMethod.paymentPackageId;
    const settingsKey = order.billing[0].paymentMethod.paymentSettingsKey;
    // check if payment provider supports de-authorize
    const checkSupportedMethods = Packages.findOne({
      _id: packageId,
      shopId: Reaction.getShopId()
    }).settings[settingsKey].support;

    const orderStatus = order.billing[0].paymentMethod.status;
    const orderMode = order.billing[0].paymentMethod.mode;

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
    }, (isConfirm, cancel)=> {
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

  handleCapturePayment = (event) => {
    event.preventDefault();

    this.setState({
      isCapturing: true
    });

    const order = this.state.order;
    Meteor.call("orders/capturePayments", order._id);
    if (order.workflow.status === "new") {
      Meteor.call("workflow/pushOrderWorkflow", "coreOrderWorkflow", "processing", order);

      Reaction.Router.setQueryParams({
        filter: "processing",
        _id: order._id
      });
    }
  }

  handleApprove = (event) => {
    event.preventDefault();
    const order = this.state.order;

    const paymentMethod = orderCreditMethod(order);
    const orderTotal = accounting.toFixed(
      paymentMethod.invoice.subtotal
      + paymentMethod.invoice.shipping
      + paymentMethod.invoice.taxes
      , 2);

    const discount = order.discount;
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

  handleRefund = (event, value) => {
    event.preventDefault();

    const currencySymbol = this.state.currency.symbol;
    const order = this.state.order;
    const paymentMethod = orderCreditMethod(order).paymentMethod;
    const orderTotal = paymentMethod.amount;
    const discounts = paymentMethod.discounts;
    const refund = value;
    const refunds = this.state.refunds;
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

  render() {
    return (
      <TranslationProvider>
        <Invoice
          {...this.props}

          getSelectedItemsInfo={this.getSelectedItemsInfo}
          handleClick={this.handleClick}
          handleSelectAllItems={this.handleSelectAllItems}
          onClose={this.handleClose}
          togglePopOver={this.togglePopOver}
          handleInputChange={this.handleInputChange}
          handleItemSelect={this.handleItemSelect}
          displayMedia={this.handleDisplayMedia}
          toggleUpdating={this.toggleUpdating}
          handleReturnItems={this.handleReturnItems}
          getRefundedItemsInfo={this.getRefundedItemsInfo}
          handleApprove={this.handleApprove}
          isAdjusted={this.isAdjusted}
          handleCapturePayment={this.handleCapturePayment}
          handleRefund={this.handleRefund}

          isOpen={this.state.isOpen}
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
      </TranslationProvider>
    );
  }
}

// helper to return the order payment object
// the first credit paymentMethod on the order
// returns entire payment method
function orderCreditMethod(order) {
  return order.billing.filter(value => value.paymentMethod.method ===  "credit")[0];
}

const composer = (props, onData) => {
  const order = props.order;
  const refunds = props.refunds;

  const paymentMethod = orderCreditMethod(order).paymentMethod;
  const orderStatus = orderCreditMethod(order).paymentMethod.status;
  const orderMode = orderCreditMethod(order).paymentMethod.mode;
  const orderDiscounts = orderCreditMethod(order).invoice.discounts;

  const paymentApproved = order.billing[0].paymentMethod.status === "approved";
  const paymentCaptured = orderStatus === "completed" ||
    (orderStatus === "refunded" && orderMode === "capture") ||
    (orderStatus === "partialRefund" && orderMode === "capture");
  const paymentPendingApproval = orderStatus === "created" || orderStatus === "adjustments" || orderStatus === "error";
  const showAfterPaymentCaptured = orderStatus === "completed";

  // get whether adjustments can be made
  let canMakeAdjustments;

  if (orderStatus === "approved" || orderStatus === "completed" || orderStatus === "refunded" || orderStatus === "partialRefund") {
    canMakeAdjustments = false;
  } else {
    canMakeAdjustments = true;
  }

  // get adjusted Total
  let adjustedTotal;
  let refundTotal = 0;

  _.each(refunds, function (item) {
    refundTotal += parseFloat(item.amount);
  });

  if (paymentMethod.processor === "Stripe") {
    adjustedTotal = Math.abs(paymentMethod.amount + orderDiscounts - refundTotal);
  }
  adjustedTotal = Math.abs(paymentMethod.amount - refundTotal);

  // get invoice
  const invoice = Object.assign({}, order.billing[0].invoice, {
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

  // returns order items with shipping detail
  const returnItems = _.map(order.items, (item) => {
    const shipping = shipment.shipmentMethod;
    return _.extend(item, { shipping });
  });

  let uniqueItems;

  // if avalara tax has been enabled it adds a "taxDetail" field for every item
  if (order.taxes !== undefined) {
    const taxes = order.taxes.slice(0, -1);

    uniqueItems = _.map(returnItems, (item) => {
      const taxDetail = _.find(taxes, {
        lineNumber: item._id
      });
      return _.extend(item, { taxDetail });
    });
  } else {
    uniqueItems = returnItems;
  }

  // print order
  const printOrder = Reaction.Router.pathFor("dashboard/pdf/orders", {
    hash: {
      id: props.order._id,
      shipment: props.currentData.fulfillment._id
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
    isFetching: props.isFetching,
    currency: props.currency,
    order: props.order,
    refunds: props.refunds
  });
};

export default composeWithTracker(composer)(InvoiceContainer);
