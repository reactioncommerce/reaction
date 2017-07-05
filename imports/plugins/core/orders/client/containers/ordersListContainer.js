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
      hasMoreOrders: props.hasMoreOrders()
    };

    this.handleClick = this.handleClick.bind(this);
    this.handleListToggle = this.handleListToggle.bind(this);
    this.handleDetailToggle = this.handleDetailToggle.bind(this);
    this.handleDisplayMedia = this.handleDisplayMedia.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
  }

  componentWillReceiveProps = (nextProps) => {
    this.setState({
      orders: nextProps.orders,
      hasMoreOrders: nextProps.hasMoreOrders()
    });
  }

  handleSelect = (event, bla1, bla2) => {
    const originalArray = this.state.selectedItems;

    if (!originalArray.includes(bla2)) {
      originalArray.push(bla2);
      this.setState({
        selectedItems: originalArray
      });
    } else {
      const newArray = originalArray.filter((id) => {
        if (id !== bla2) {
          return id;
        }
      });
      this.setState({
        selectedItems: newArray
      });
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
