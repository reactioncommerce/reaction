import React, { Component, PropTypes } from "react";
import { Meteor } from "meteor/meteor";
import { composeWithTracker } from "/lib/api/compose";
import { Media } from "/lib/collections";
import { Reaction } from "/client/api";
import { Loading } from "/imports/plugins/core/ui/client/components";
import OrdersList from "../components/ordersList.js";
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
      openDetail: false,
      openList: true,
      selectedItems: [],
      orders: props.orders,
      hasMoreOrders: props.hasMoreOrders(),
      multipleSelect: false
    };

    this.handleClick = this.handleClick.bind(this);
    this.handleListToggle = this.handleListToggle.bind(this);
    this.handleDetailToggle = this.handleDetailToggle.bind(this);
    this.handleDisplayMedia = this.handleDisplayMedia.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
    this.selectAllOrders = this.selectAllOrders.bind(this);
  }

  componentWillReceiveProps = (nextProps) => {
    this.setState({
      orders: nextProps.orders,
      hasMoreOrders: nextProps.hasMoreOrders()
    });
  }

  handleSelect = (event, isInputChecked, name) => {
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
        selectedItems: updatedSelectedArray,
        multipleSelect: false
      });
    }
  }

  selectAllOrders = (orders, areAllSelected) => {
    const selected = this.state.selectedItems;
    if (areAllSelected) {
      // if all orders are selected, clear the selectedItems array
      // and set multipleSelect to false
      this.setState({
        selectedItems: [],
        multipleSelect: false
      });
    } else {
      // if there are some orders that have been selected,
      // but not all clear the selectedItems array
      if (selected.length !== 0 && selected.length < orders.length) {
        this.setState({
          selectedItems: [],
          multipleSelect: false
        });
        // if there are no selected orders, loop through the orders array and return a
        // new array with order ids only, then set the array with the orderIds array
      } else if (selected.length === 0) {
        const orderIds = orders.map((order) => {
          return order._id;
        });
        this.setState({
          selectedItems: orderIds,
          multipleSelect: true
        });
      }
    }
  }

  handleClick = (order, startWorkflow = true) => {
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
      Reaction.setUserPreferences(PACKAGE_NAME, ORDER_LIST_SELECTED_ORDER_PREFERENCE_NAME, order._id);
    }
  }

  handleListToggle = () => {
    this.setState({
      openList: true,
      openDetail: false
    });
  }

  handleDetailToggle = () => {
    this.setState({
      openDetail: true,
      openList: false
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

  render() {
    const { handleShowMoreClick } = this.props;

    return (
        <OrdersList
          handleSelect={this.handleSelect}
          handleShowMoreClick={handleShowMoreClick}
          orders={this.state.orders}
          hasMoreOrders={this.state.hasMoreOrders}
          handleClick={this.handleClick}
          displayMedia={this.handleDisplayMedia}
          handleListToggle={this.handleListToggle}
          handleDetailToggle={this.handleDetailToggle}
          openDetail= {this.state.openDetail}
          selectedItems={this.state.selectedItems}
          openList={this.state.openList}
          selectAllOrders={this.selectAllOrders}
          multipleSelect={this.state.multipleSelect}
        />
    );
  }
}

const composer = (props, onData) => {
  const subscription = Meteor.subscribe("Media");
  if (subscription.ready()) {
    onData(null, {
      uniqueItems: props.items,
      invoice: props.invoice
    });
  }
};

export default composeWithTracker(composer, Loading)(OrdersListContainer);
