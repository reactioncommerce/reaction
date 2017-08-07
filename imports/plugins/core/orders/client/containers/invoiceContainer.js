import React, { Component } from "react";
import PropTypes from "prop-types";
import moment from "moment";
import accounting from "accounting-js";
import _ from "lodash";
import { i18next, Logger, Reaction } from "/client/api";
import { Tracker } from "meteor/tracker";
import { Meteor } from "meteor/meteor";
import { Media, Shops, Orders } from "/lib/collections";
import { composeWithTracker } from "/lib/api/compose";
import { Loading } from "/imports/plugins/core/ui/client/components";
import { TranslationProvider } from "/imports/plugins/core/ui/client/providers";
import Invoice from "../components/invoice.js";


class InvoiceContainer extends Component {
  static propTypes = {
    canMakeAdjustments: PropTypes.bool,
    collection: PropTypes.string,
    discounts: PropTypes.bool,
    invoice: PropTypes.object,
    isFetching: PropTypes.bool,
    orderId: PropTypes.string,
    paymentCaptured: PropTypes.bool,
    refunds: PropTypes.array
  }

  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      notHovered: true,
      isClosed: false,
      isUpdating: false,
      popOverIsOpen: false,
      selectAllItems: false,
      selectedItems: [],
      editedItems: [],
      value: undefined,
      isCapturing: false,
      currency: props.currency,
      refunds: props.refunds,
      isFetching: true,
      order: props.order,
      isRefunding: false,
      refundValue: 0
    };
    this.handleClick = this.handleClick.bind(this);
    this.dateFormat = this.dateFormat.bind(this);
    this.handleDisplayMedia = this.handleDisplayMedia.bind(this);
    this.applyRefund = this.applyRefund.bind(this);
    this.handleRefund = this.handleRefund.bind(this);
    this.dep = new Tracker.Dependency;
  }

  // componentWillUnmount() {
  //   this.subscription.stop();
  // }

  componentDidMount() {
    Tracker.autorun(() => {
      this.dep.depend();

      // this.subscription = Meteor.subscribe("Orders");
      // console.log("sub", this.subscription);
      // if (this.subscription) {
      //   console.log("Here");
      //   const order = Orders.findOne(this.props.currentData.orderId);
      //   const shop = Shops.findOne({});
      //   const currency = shop.currencies[shop.currency];
      //   this.setState({
      //     currency,
      //     order
      //   });
      //   console.log("order====>", order);
      //   if (order) {
      //     Meteor.call("orders/refunds/list", order, (error, result) => {
      //       if (error) Logger.warn(error);
      //       this.setState({
      //         refunds: result,
      //         isFetching: false
      //       });
      //     });
      //   }
      // }
      // });
      // const order = this.state.order;
      // if (order) {
      //   Meteor.call("orders/refunds/list", order, (error, result) => {
      //     if (error) Logger.warn(error);
      //     this.setState({
      //       refunds: result,
      //       isFetching: false
      //     });
      //   });
      // }
    });
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

  dateFormat = (context, block) => {
    const f = block || "MMM DD, YYYY hh:mm:ss A";
    return moment(context).format(f);
  }

  handleClick = (event) => {
    event.preventDefault();
    this.setState({
      isOpen: true
    });
  }

  togglePopOver = () => {
    if (this.state.popOverIsOpen) {
      return this.setState({
        popOverIsOpen: false,
        selectAllItems: false,
        selectedItems: [],
        editedItems: []
      });
    }
    return this.setState({ popOverIsOpen: true });
  }

  toggleUpdating = (isUpdating) => {
    return this.setState({ isUpdating });
  }

  handleSelectAllItems = (uniqueItems) => {
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
        return item._id;
      });
      this.setState({
        selectedItems: itemIds,
        selectAllItems: true,
        isUpdating: true
      });
    }
  }

  inputOnChange = (event, value, lineItem) => {
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
      editedItems
    });
  }

  handleItemSelect = (itemId) => {
    const { selectedItems, editedItems } = this.state;

    if (!selectedItems.includes(itemId)) {
      selectedItems.push(itemId);
      this.setState({
        selectedItems,
        isUpdating: true,
        selectAllItems: false
      });
    } else {
      // remove item from selected items
      const updatedSelectedArray = selectedItems.filter((id) => {
        if (id !== itemId) {
          return id;
        }
      });
      // remove item from edited quantities
      const updatedEditedItems = editedItems.filter(item => item.id !== itemId);

      this.setState({
        selectedItems: updatedSelectedArray,
        isUpdating: true,
        selectAllItems: false,
        editedItems: updatedEditedItems
      });
    }
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

  applyRefund = () => {
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
        Meteor.call("orders/refunds/returnItems", this.state.order._id, paymentMethod, editedItems, (error, result) => {
          if (error) {
            Alerts.alert(error.reason);
          }
          if (result) {
            Alerts.toast(i18next.t("mail.alerts.emailSent"), "success");
          }
          this.setState({
            refundValue: 0,
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

  isAdjusted = () => {
    // const { adjustedTotal, invoice } = this.props;
    const invoice = this.invoice();
    const adjustedTotal = this.adjustedTotal();

    if (invoice.total === adjustedTotal) {
      return false;
    }
    return true;
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
              refundValue: 0,
              isRefunding: false
            });
          });
        }
      });
    }
  }

  adjustedTotal = () => {
    const order = this.state.order;
    const paymentMethod = orderCreditMethod(order).paymentMethod;
    const discounts = orderCreditMethod(order).invoice.discounts;
    const refunds = this.state.refunds;
    let refundTotal = 0;

    _.each(refunds, function (item) {
      refundTotal += parseFloat(item.amount);
    });

    if (paymentMethod.processor === "Stripe") {
      return Math.abs(paymentMethod.amount + discounts - refundTotal);
    }
    return Math.abs(paymentMethod.amount - refundTotal);
  }

  showAfterPaymentCaptured = () => {
    const order = this.state.order;
    const orderStatus = orderCreditMethod(order).paymentMethod.status;
    return orderStatus === "completed";
  }

  printOrder = () => {
    const order = this.state.order;
    const currentData = this.props.currentData;
    return Reaction.Router.pathFor("dashboard/pdf/orders", {
      hash: {
        id: order._id,
        shipment: currentData.fulfillment._id
      }
    });
  }

  discounts() {
    const enabledPaymentsArr = [];
    const apps = Reaction.Apps({
      provides: "paymentMethod",
      enabled: true
    });
    for (const app of apps) {
      if (app.enabled === true) enabledPaymentsArr.push(app);
    }
    let discount = false;

    for (const enabled of enabledPaymentsArr) {
      if (enabled.packageName === "discount-codes") {
        discount = true;
        break;
      }
    }
    return discount;
  }

  invoice() {
    const order = this.state.order;

    const invoice = Object.assign({}, order.billing[0].invoice, {
      totalItems: _.sumBy(order.items, (o) => o.quantity)
    });
    return invoice;
  }

  paymentPendingApproval() {
    const order = this.state.order;
    const status = orderCreditMethod(order).paymentMethod.status;
    return status === "created" || status === "adjustments" || status === "error";
  }

  canMakeAdjustments() {
    const order = this.state.order;
    const status = orderCreditMethod(order).paymentMethod.status;

    if (status === "approved" || status === "completed" || status === "refunded") {
      return false;
    }
    return true;
  }

  paymentApproved() {
    const order = this.state.order;

    return order.billing[0].paymentMethod.status === "approved";
  }

  paymentCaptured() {
    const order = this.state.order;
    const orderStatus = orderCreditMethod(order).paymentMethod.status;
    const orderMode = orderCreditMethod(order).paymentMethod.mode;
    return orderStatus === "completed" || (orderStatus === "refunded" && orderMode === "capture") || (orderStatus === "partialRefund" && orderMode === "capture");
  }

  items() {
    const order = this.state.order;
    const currentData = this.props.currentData;
    const shipment = currentData.fulfillment;

    // returns order items with shipping detail
    const returnItems = _.map(order.items, (item) => {
      const shipping = shipment.shipmentMethod;
      return _.extend(item, { shipping });
    });

    let items;


    // if avalara tax has been enabled it adds a "taxDetail" field for every item
    if (order.taxes !== undefined) {
      const taxes = order.taxes.slice(0, -1);

      items = _.map(returnItems, (item) => {
        const taxDetail = _.find(taxes, {
          lineNumber: item._id
        });
        return _.extend(item, { taxDetail });
      });
    } else {
      items = returnItems;
    }
    return items;
  }

  render() {
    const { isFetching } = this.props;

    return (
      <TranslationProvider>
        <Invoice
          canMakeAdjustments={this.canMakeAdjustments()}
          paymentCaptured={this.paymentCaptured()}
          isOpen={this.state.isOpen}
          discounts={this.discounts()}
          handleClick={this.handleClick}
          invoice={this.invoice()}
          refunds={this.state.refunds}
          dateFormat={this.dateFormat}
          isFetching={isFetching}
          onClose={this.handleClose}
          isCapturing={this.state.isCapturing}
          handleSelectAllItems={this.handleSelectAllItems}
          selectAllItems={this.state.selectAllItems}
          selectedItems={this.state.selectedItems}
          togglePopOver={this.togglePopOver}
          inputOnChange={this.inputOnChange}
          handleItemSelect={this.handleItemSelect}
          popOverIsOpen={this.state.popOverIsOpen}
          displayMedia={this.handleDisplayMedia}
          uniqueItems={this.items()}
          editedItems={this.state.editedItems}
          isUpdating={this.state.isUpdating}
          toggleUpdating={this.toggleUpdating}
          applyRefund={this.applyRefund}
          getRefundedItemsInfo={this.getRefundedItemsInfo}
          paymentPendingApproval={this.paymentPendingApproval()}
          paymentApproved={this.paymentApproved()}
          capturedDisabled={this.props.capturedDisabled}
          handleApprove={this.handleApprove}
          isAdjusted={this.isAdjusted}
          handleCapturePayment={this.handleCapturePayment}
          currency={this.state.currency}
          handleRefund={this.handleRefund}
          adjustedTotal={this.adjustedTotal()}
          showAfterPaymentCaptured={this.showAfterPaymentCaptured}
          printOrder={this.printOrder}
          isRefunding={this.state.isRefunding}
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
  // const order = Orders.findOne(props.currentData.orderId);
  // const shop = Shops.findOne({});
  // const currency = shop.currencies[shop.currency];
  // console.log("order", order);

  onData(null, {
    currentData: props.currentData,
    isFetching: props.isFetching,
    currency: props.currency,
    order: props.order,
    refunds: props.refunds
  });
};

export default composeWithTracker(composer, Loading)(InvoiceContainer);
