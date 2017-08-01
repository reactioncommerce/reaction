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

    this.handleClick = this.handleClick.bind(this);
    this.handleDisplayMedia = this.handleDisplayMedia.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
    this.selectAllOrders = this.selectAllOrders.bind(this);
    this.pickedShippingStatus = this.pickedShippingStatus.bind(this);
    this.packedShippingStatus = this.packedShippingStatus.bind(this);
    this.labeledShippingStatus = this.labeledShippingStatus.bind(this);
    this.shippedShippingStatus = this.shippedShippingStatus.bind(this);
    this.setShippingStatus = this.setShippingStatus.bind(this);
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

  shippingStatusUpdateCall = (selectedOrders, status) => {
    const capitalizeStatus = status[0].toUpperCase() + status.substr(1).toLowerCase();

    selectedOrders.forEach((order) => {
      Meteor.call(`orders/shipment${capitalizeStatus}`, order, order.shipping[0], true, (err) => {
        if (err) {
          Alerts.toast("Error", "error");
        } else {
          Meteor.call("orders/updateHistory", order._id, "State set by bulk action", status);
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

    selectedOrders.forEach((order) => {
      if (order.shipping[0].picked === false) {
        falsePickedStatuses++;
      }
    });

    if (falsePickedStatuses === 0) {
      Alerts.alert({
        text: `${selectedOrders.length > 1 ? "Orders are" : "Order is"} already in picked state`
      });
    } else {
      this.shippingStatusUpdateCall(selectedOrders, status);
    }
  }

  packedShippingStatus = (selectedOrders, status) => {
    let falsePackedStatuses = 0;
    let falsePickedAndPackedStatuses = 0;

    selectedOrders.forEach((order) => {
      if (order.shipping[0].picked && order.shipping[0].packed === false) {
        falsePackedStatuses++;
      } else if (order.shipping[0].picked === false && order.shipping[0].packed === false) {
        falsePickedAndPackedStatuses++;
      }
    });

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
    } else if (falsePackedStatuses === 0 && falsePickedAndPackedStatuses === 0) {
      Alerts.alert({
        text: `${selectedOrders.length > 1 ? "Orders are" : "Order is"} already in packed state`
      });
    } else if (falsePackedStatuses && falsePickedAndPackedStatuses === 0) {
      this.shippingStatusUpdateCall(selectedOrders, status);
    }
  }

  labeledShippingStatus = (selectedOrders) => {
    selectedOrders.forEach((order) => {
      if (order.shipping[0].picked && order.shipping[0].packed && order.shipping[0].labeled === false) {
        Meteor.call("orders/shipmentLabeled", order, order.shipping[0], true, (err) => {
          if (err) {
            Alerts.toast("Error", "error");
          } else {
            Meteor.call("orders/updateHistory", order._id, "State set by bulk action", "labeled");
            Alerts.alert({
              text: `Order with id ${order._id} shipping status set to labeled`,
              type: "success"
            });
          }

          this.setState({
            labeled: true
          });
        });
      } else if (order.shipping[0].picked === false || order.shipping[0].packed === false) {
        Alerts.alert({
          text: `You've requested that order ${order._id} be set to the "Labeled" status, but it is not in the "Picked"
                state and would skip all steps leading up to the "Labeled" state. Are you sure you want to do this?`,
          type: "warning",
          showCancelButton: true,
          showCloseButton: true,
          confirmButtonText: "Yes, Set All Selected Orders"
        }, (setSelected) => {
          if (setSelected) {
            Meteor.call("orders/shipmentLabeled", order, order.shipping[0], true, (err) => {
              if (err) {
                Alerts.toast("Error", "error");
              } else {
                Meteor.call("orders/updateHistory", order._id, "State set by bulk action", "labeled");
                Alerts.alert({
                  text: `Order with id ${order._id} shipping status set to labeled`,
                  type: "success"
                });
              }

              this.setState({
                labeled: true
              });
            });
          }
        });
      } else {
        Alerts.alert({
          text: "Order is already in the labeled state"
        });
      }
    });
  }

  shippedShippingStatus = (selectedOrders) => {
    selectedOrders.forEach((order) => {
      if (order.shipping[0].picked && order.shipping[0].packed && order.shipping[0].labeled && order.shipping[0].shipped === false) {
        Meteor.call("orders/shipmentShipped", order, order.shipping[0], (err) => {
          if (err) {
            Alerts.toast("Error", "error");
          } else {
            Meteor.call("orders/updateHistory", order._id, "State set by bulk action", "shipped");
            Alerts.alert({
              text: `Order with id ${order._id} shipping status set to shipped`,
              type: "success"
            });
          }
          this.setState({
            shipped: true
          });
        });
      } else if (order.shipping[0].picked === false || order.shipping[0].packed === false || order.shipping[0].labeled === false) {
        Alerts.alert({
          text: `You've requested that order ${order._id} be set to the "Shipped" status, but it is not in the "Packed"
                state and would skip all steps leading up to the "Shipped" state. Are you sure you want to do this?`,
          type: "warning",
          showCancelButton: true,
          showCloseButton: true,
          confirmButtonText: "Yes, Set All Selected Orders"
        }, (setSelected) => {
          if (setSelected) {
            Meteor.call("orders/shipmentShipped", order, order.shipping[0], (err) => {
              if (err) {
                Alerts.toast("Error", "error");
              } else {
                Meteor.call("orders/updateHistory", order._id, "State set by bulk action", "shipped");
                Alerts.alert({
                  text: `Order with id ${order._id} shipping status set to shipped`,
                  type: "success"
                });
              }
              this.setState({
                shipped: true
              });
            });
          }
        });
      } else {
        Alerts.alert({
          text: "Order is already in the shipped state"
        });
      }
    });
  }

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
      this.labeledShippingStatus(selectedOrders);
    }

    if (status === "shipped") {
      this.shippedShippingStatus(selectedOrders);
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
