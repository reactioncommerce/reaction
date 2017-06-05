import React, { Component, PropTypes } from "react";
import moment from "moment";
import _ from "lodash";
import { Meteor } from "meteor/meteor";
import { composeWithTracker } from "/lib/api/compose";
import { Orders } from "/lib/collections";
import { i18next, Reaction } from "/client/api";
import OrderSummary from "../components/orderSummary";





import { Media } from "/lib/collections";
import { Loading } from "/imports/plugins/core/ui/client/components";
import OrdersList from "../components/ordersList.js";

class OrdersListContainer extends Component {
  static propTypes = {
    invoice: PropTypes.object,
    uniqueItems: PropTypes.array
  }

  constructor(props) {
    super(props);
    this.state = {
      isClosed: false
    };

    this.handleClick = this.handleClick.bind(this);
    this.isExpanded = this.isExpanded.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleDisplayMedia = this.handleDisplayMedia.bind(this);
  }


  isExpanded = (itemId) => {
    if (this.state[`item_${itemId}`]) {
      return true;
    }
    return false;
  }

  handleClose = (itemId) => {
    this.setState({
      [`item_${itemId}`]: false
    });
  }

  handleClick = (order) => {
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
    // this.setState({
    //   [`item_${itemId}`]: true
    // });
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
    const { orders } = this.props;

    return (
        <OrdersList
          orders={orders}
          handleClick={this.handleClick}
          displayMedia={this.handleDisplayMedia}
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
