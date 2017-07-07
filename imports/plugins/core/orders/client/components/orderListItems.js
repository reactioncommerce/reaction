import React, { Component } from "react";
import PropTypes from "prop-types";
import { Currency } from "/imports/plugins/core/ui/client/components/";

class OrderListItem extends Component {
  static propTypes = {
    media: PropTypes.func,
    shopItemMap: PropTypes.object
  }
  render() {
    const { media, shopItemMap } = this.props;
    const shopNames = Object.keys(shopItemMap);
    return (
      <div>
        {shopNames.map((shopName, index) => {
          return (
            <div key={index}>
              <div className="order-vendor-container">
                <strong>
                  <span id="order-group-name" className="order-vendor">{shopName}</span>
                </strong>
              </div>
              <div className="order-list-items">
              {shopItemMap[shopName].map(item => {
                return (
                  <div key={item._id}>
                    <div className="order-item">
                      <div className="order-item-media">
                        {media(item) ?
                          <img src={media.url({ store: "thumbnail" })} /> :
                          <img src="/resources/placeholder.gif" />}
                      </div>

                      <div className="order-item-details">

                        <div className="order-detail-title">
                          {item.title} <small>{item.variants.title}</small>
                        </div>

                        <div className="order-detail-quantity">
                          <span style={{ textAlign: "center" }}>{item.quantity}</span>
                        </div>

                        <span className="order-detail-price">
                          <span><Currency amount={item.quantity * item.variants.price} /></span>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
              </div>
            </div>
          );
        })}
      </div>
    );
  }
}

export default OrderListItem;
