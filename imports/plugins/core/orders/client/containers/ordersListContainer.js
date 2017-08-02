import React, { Component } from "react";
import PropTypes from "prop-types";
import { composeWithTracker } from "@reactioncommerce/reaction-components";
import { Meteor } from "meteor/meteor";
import { Orders, Shops, Media } from "/lib/collections";
import { Reaction } from "/client/api";
import { Loading } from "/imports/plugins/core/ui/client/components";
import OrdersList from "../components/orderList.js";
import {
  PACKAGE_NAME,
  ORDER_LIST_FILTERS_PREFERENCE_NAME,
  ORDER_LIST_SELECTED_ORDER_PREFERENCE_NAME
} from "../../lib/constants";


class OrdersListContainer extends Component {
  static propTypes = {
    handleShowMoreClick: PropTypes.func,
    hasMoreOrders: PropTypes.func,
    invoice: PropTypes.object,
    orders: PropTypes.array,
    uniqueItems: PropTypes.array
  }

  constructor(props) {
    super(props);

    this.state = {
      selectedItems: [],
      orders: props.orders,
      multipleSelect: false,
      picked: false,
      packed: false,
      labeled: false,
      shipped: false
    };
  }

  componentWillReceiveProps = (nextProps) => {
    this.setState({
      orders: nextProps.orders
    });
  }

  handleSelect = (event, isInputChecked, name) => {
    this.setState({
      multipleSelect: false
    });
    const selectedItemsArray = this.state.selectedItems;

    if (!selectedItemsArray.includes(name)) {
      selectedItemsArray.push(name);
      this.setState({
        selectedItems: selectedItemsArray
      });
    } else {
      const updatedSelectedArray = selectedItemsArray.filter((id) => {
        if (id !== name) {
          return id;
        }
      });
      this.setState({
        selectedItems: updatedSelectedArray
      });
    }
  }

  selectAllOrders = (orders, areAllSelected) => {
    if (areAllSelected) {
      // if all orders are selected, clear the selectedItems array
      // and set multipleSelect to false
      this.setState({
        selectedItems: [],
        multipleSelect: false
      });
    } else {
      // if there are no selected orders, or if there are some orders that have been
      // selected but not all of them, loop through the orders array and return a
      // new array with order ids only, then set the selectedItems array with the orderIds
      const orderIds = orders.map((order) => {
        return order._id;
      });
      this.setState({
        selectedItems: orderIds,
        multipleSelect: true
      });
    }
  }

  handleClick = (order, startWorkflow = false) => {
    Reaction.setActionViewDetail({
      label: "Order Details",
      i18nKeyLabel: "orderWorkflow.orderDetails",
      data: {
        order: order
      },
      props: {
        size: "large"
      },
      template: "coreOrderWorkflow"
    });

    if (startWorkflow === true) {
      Meteor.call("workflow/pushOrderWorkflow", "coreOrderWorkflow", "processing", order);
      Reaction.setUserPreferences(PACKAGE_NAME, ORDER_LIST_FILTERS_PREFERENCE_NAME, "processing");
    }

    Reaction.setUserPreferences(PACKAGE_NAME, ORDER_LIST_SELECTED_ORDER_PREFERENCE_NAME, order._id);
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

  /**
   * shippingStatusUpdateCall
   *
   * @summary set selected order(s) to the provided shipping state
   * @param {Array} selectedOrders - array of selected orders
   * @param {String} status - the shipping status to be set
   * @return {null} no return value
   */
  shippingStatusUpdateCall = (selectedOrders, status) => {
    const capitalizeStatus = status[0].toUpperCase() + status.substr(1).toLowerCase();

    selectedOrders.forEach((order) => {
      Meteor.call(`orders/shipment${capitalizeStatus}`, order, order.shipping[0], true, (err) => {
        if (err) {
          Alerts.toast(`An error occured while setting the status: ${err}`, "error");
        } else {
          Meteor.call("orders/updateHistory", order._id, "Shipping state set by bulk operation", status);
        }
        this.setState({
          [status]: true
        });
      });
    });
    Alerts.alert({
      text: `${selectedOrders.length} ${selectedOrders.length > 1 ? "orders" : "order"} set to ${status}`,
      type: "success"
    });
  }

  pickedShippingStatus = (selectedOrders, status) => {
    let falsePickedStatuses = 0;

    // check if any of the selected order(s) have false 'Picked' status
    selectedOrders.forEach((order) => {
      if (order.shipping[0].picked === false) {
        falsePickedStatuses++;
      }
    });

    // if any of the selected order(s) don't have a false 'Picked' status,
    // show an alert that the order(s) are already in the picked state
    if (falsePickedStatuses === 0) {
      Alerts.alert({
        text: `${selectedOrders.length > 1 ? "Orders are" : "Order is"} already in picked state`
      });
    // if any of the orders have a false status of picked, set it to true
    } else {
      this.shippingStatusUpdateCall(selectedOrders, status);
    }
  }

  packedShippingStatus = (selectedOrders, status) => {
    let falsePackedStatuses = 0;
    let falsePickedAndPackedStatuses = 0;

    // check if any of the selected order(s) have false 'Picked'
    // or 'Packed' status, or have them both as false
    selectedOrders.forEach((order) => {
      if (order.shipping[0].picked && order.shipping[0].packed === false) {
        falsePackedStatuses++;
      } else if (order.shipping[0].picked === false && order.shipping[0].packed === false) {
        falsePickedAndPackedStatuses++;
      }
    });

    // if any of the selected order(s) have both 'Picked' and 'Packed' as false,
    // display modal that asks if the user wants to proceed with the operation
    if (falsePickedAndPackedStatuses) {
      Alerts.alert({
        text: `You've requested that ${selectedOrders.length} ${selectedOrders.length > 1 ? "orders" : "order"} be set to the "Packed"
              status, but ${falsePickedAndPackedStatuses} of these orders ${falsePickedAndPackedStatuses === 1 ? "is" : "are"} not in
              the "Picked" state and would skip all steps leading up to the "Packed" state. Are you sure you want to do this?`,
        type: "warning",
        showCancelButton: true,
        showCloseButton: true,
        allowOutsideClick: false,
        confirmButtonText: "Yes, Set All Selected Orders",
        cancelButtonText: "No, Cancel"
      }, (setSelected) => {
        if (setSelected) {
          this.shippingStatusUpdateCall(selectedOrders, status);
        }
      });
      // if neither status is false, alert that order(s) are already in the 'Packed' state
    } else if (falsePackedStatuses === 0 && falsePickedAndPackedStatuses === 0) {
      Alerts.alert({
        text: `${selectedOrders.length > 1 ? "Orders are" : "Order is"} already in packed state`
      });
      // if only 'Packed' is false, proced to set it to true
    } else if (falsePackedStatuses && falsePickedAndPackedStatuses === 0) {
      this.shippingStatusUpdateCall(selectedOrders, status);
    }
  }

  labeledShippingStatus = (selectedOrders, status) => {
    let falseLabeledStatuses = 0;
    let falsePickedAndPackedAndLabeledStatuses = 0;
    let whichFalseState = "";

    selectedOrders.forEach((order) => {
      // set the variable 'whichFalseState' with the relevant false shipping status to display in the below modal
      if (order.shipping[0].picked === false) {
        whichFalseState = "Picked";
      } else if (order.shipping[0].packed === false) {
        whichFalseState = "Packed";
      } else if (order.shipping[0].picked === false && order.shipping[0].packed === false) {
        whichFalseState = "Picked";
      }

      // check if any of the selected order(s) have either 'Picked', 'Packed' or 'Labeled' status as false, or have them all as false.
      if (order.shipping[0].picked && order.shipping[0].packed && order.shipping[0].labeled === false) {
        falseLabeledStatuses++;
      } else if ((order.shipping[0].picked === false || order.shipping[0].packed === false) && order.shipping[0].labeled === false) {
        falsePickedAndPackedAndLabeledStatuses++;
      }
    });

    // if any of the selected order(s) have 'Picked', 'Packed' and 'Labeled' as false,
    // display modal that asks if the user wants to proceed with the operation
    if (falsePickedAndPackedAndLabeledStatuses) {
      Alerts.alert({
        text: `You've requested that ${selectedOrders.length} ${selectedOrders.length > 1 ? "orders" : "order"} be set to the "Labeled" status, but
              ${falsePickedAndPackedAndLabeledStatuses} of these orders ${falsePickedAndPackedAndLabeledStatuses === 1 ? "is" : "are"} not in
              the "${whichFalseState}" state and would skip all steps leading up to the "Labeled" state. Are you sure you want to do this?`,
        type: "warning",
        showCancelButton: true,
        showCloseButton: true,
        allowOutsideClick: false,
        confirmButtonText: "Yes, Set All Selected Orders",
        cancelButtonText: "No, Cancel"
      }, (setSelected) => {
        if (setSelected) {
          this.shippingStatusUpdateCall(selectedOrders, status);
        }
      });
      // if none of the three statuses are false, alert that order(s) are already in the 'Labeled' state
    } else if (falseLabeledStatuses === 0 && falsePickedAndPackedAndLabeledStatuses === 0) {
      Alerts.alert({
        text: `${selectedOrders.length > 1 ? "Orders are" : "Order is"} already in labeled state`
      });
      // if only 'Labeled' is false, proced to set it to true
    } else if (falseLabeledStatuses && falsePickedAndPackedAndLabeledStatuses === 0) {
      this.shippingStatusUpdateCall(selectedOrders, status);
    }
  }

  shippedShippingStatus = (selectedOrders, status) => {
    let falseShippedStatuses = 0;
    let falsePreviousStatuses = 0;
    let whichFalseState = "";

    selectedOrders.forEach((order) => {
      // set the variable 'whichFalseState' with the relevant false shipping status to display in the below modal
      if (order.shipping[0].picked === false) {
        whichFalseState = "Picked";
      } else if (order.shipping[0].packed === false) {
        whichFalseState = "Packed";
      } else if (order.shipping[0].labeled === false) {
        whichFalseState = "Labeled";
      } else if (order.shipping[0].picked === false && order.shipping[0].packed === false && order.shipping[0].labeled === false) {
        whichFalseState = "Picked";
      }

      // check if any of the selected order(s) have either 'Picked', 'Packed', 'Labeled' or
      // 'Shipped' status as false, or have them all as false.
      if (order.shipping[0].picked && order.shipping[0].packed && order.shipping[0].labeled && order.shipping[0].shipped === false) {
        falseShippedStatuses++;
      } else if ((order.shipping[0].picked === false || order.shipping[0].packed === false ||
        order.shipping[0].labeled === false) && order.shipping[0].shipped === false) {
        falsePreviousStatuses++;
      }
    });

    // if any of the selected order(s) have 'Picked', 'Packed', 'Labeled' and 'Shipped' as
    // false, display modal that asks if the user wants to proceed with the operation
    if (falsePreviousStatuses) {
      Alerts.alert({
        text: `You've requested that ${selectedOrders.length} ${selectedOrders.length > 1 ? "orders" : "order"} be
          set to the "Shipped" status, but ${falsePreviousStatuses} of these orders ${falsePreviousStatuses === 1 ? "is" : "are"}
          not in the "${whichFalseState}" state and would skip all steps leading up to the "Shipped" state. Are you sure you want to do this?`,
        type: "warning",
        showCancelButton: true,
        showCloseButton: true,
        allowOutsideClick: false,
        confirmButtonText: "Yes, Set All Selected Orders",
        cancelButtonText: "No, Cancel"
      }, (setSelected) => {
        if (setSelected) {
          this.shippingStatusUpdateCall(selectedOrders, status);
        }
      });
      // if none of the four statuses are false, alert that order(s) are already in the 'Shipped' state
    } else if (falseShippedStatuses === 0 && falsePreviousStatuses === 0) {
      Alerts.alert({
        text: `${selectedOrders.length > 1 ? "Orders are" : "Order is"} already in shipped state`
      });
      // if only 'Shipped' is false, proced to set it to true
    } else if (falseShippedStatuses && falsePreviousStatuses === 0) {
      this.shippingStatusUpdateCall(selectedOrders, status);
    }
  }

  /**
   * setShippingStatus
   *
   * @summary call the relevant method based on the provided shipping status
   * @param {String} status - the selected shipping status to be set
   * @param {Array} selectedOrdersIds - array of ids of the selected orders
   * @return {null} no return value
   */
  setShippingStatus = (status, selectedOrdersIds) => {
    const selectedOrders = this.state.orders.filter((order) => {
      return selectedOrdersIds.includes(order._id);
    });

    if (status === "picked") {
      this.pickedShippingStatus(selectedOrders, status);
    }

    if (status === "packed") {
      this.packedShippingStatus(selectedOrders, status);
    }

    if (status === "labeled") {
      this.labeledShippingStatus(selectedOrders, status);
    }

    if (status === "shipped") {
      this.shippedShippingStatus(selectedOrders, status);
    }
  }

  render() {
    return (
      <OrdersList
        handleSelect={this.handleSelect}
        orders={this.state.orders}
        handleClick={this.handleClick}
        displayMedia={this.handleDisplayMedia}
        selectedItems={this.state.selectedItems}
        selectAllOrders={this.selectAllOrders}
        multipleSelect={this.state.multipleSelect}
        setShippingStatus={this.setShippingStatus}
        shipped={this.state.shipped}
        packed={this.state.packed}
        labeled={this.state.labeled}
        picked={this.state.picked}
      />
    );
  }
}

const composer = (props, onData) => {
  const mediaSubscription = Meteor.subscribe("Media");
  const ordersSubscription = Meteor.subscribe("CustomPaginatedOrders");

  if (mediaSubscription.ready() && ordersSubscription.ready()) {
    const orders = Orders.find().fetch();
    const shop = Shops.findOne({});

    onData(null, {
      uniqueItems: props.items,
      invoice: props.invoice,
      orders: orders,
      currency: shop.currencies[shop.currency]
    });
  }
};

export default composeWithTracker(composer, Loading)(OrdersListContainer);
