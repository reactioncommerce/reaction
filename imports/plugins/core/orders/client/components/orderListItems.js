import React, { Component, PropTypes } from "react";
import { Currency } from "/imports/plugins/core/ui/client/components/";

class OrderListItem extends Component {
  static propTypes = {
    media: PropTypes.bool,
    orderItem: PropTypes.object
  }
  render() {
    const { orderItem, media } = this.props;
    return (
      <div className="order-items">
        <div className="order-item">
          <div className="order-item-media">
            {media ?
            <img src={media.url({ store: "thumbnail" })} /> :
            <img src= "/resources/placeholder.gif" />}
          </div>

        <div className="order-item-details">

          <div className="order-detail-title">
            {orderItem.title} <small>{orderItem.variants.title}</small>
          </div>

          <div className="order-detail-quantity">
          </div>

          <span className="order-detail-price">
            <span className="badge badge-info">{orderItem.quantity}</span>
            -
            <span><Currency amount={orderItem.variants.price} /></span>
          </span>
        </div>
      </div>
    </div>
    );
  }
}

export default OrderListItem;
