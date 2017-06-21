import React, { Component, PropTypes } from "react";
import { Currency } from "/imports/plugins/core/ui/client/components/";

class OrderListItem extends Component {
  static propTypes = {
    media: PropTypes.bool,
    orderItem: PropTypes.object,
    shopName: PropTypes.string
  }
  render() {
    const { orderItem, media, shopName } = this.props;
    return (
      <div>
        <div className="order-vendor-container">
          <strong>
            <span id="order-group-name" className="order-vendor">{shopName}</span>
          </strong>
        </div>
        <div className="order-list-items">
          <div className="order-item">
            <div className="order-item-media">
              {media ?
                <img src={media.url({ store: "thumbnail" })} /> :
                <img src="/resources/placeholder.gif" />}
            </div>

            <div className="order-item-details">

              <div className="order-detail-title">
                {orderItem.title} <small>{orderItem.variants.title}</small>
              </div>

              <div className="order-detail-quantity">
                <span style={{ textAlign: "center" }}>{orderItem.quantity}</span>
              </div>

              <span className="order-detail-price">
                <span><Currency amount={orderItem.variants.price} /></span>
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default OrderListItem;
