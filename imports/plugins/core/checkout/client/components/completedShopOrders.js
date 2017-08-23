import React from "react";
import PropTypes from "prop-types";
import { registerComponent } from "@reactioncommerce/reaction-components";

import CompletedOrderItem from "./completedOrderItem";

const CompletedShopOrders = ({ shopName, items, handleDisplayMedia, shippingMethod }) => {
  return (
    <div>
      {/* This is the left side / main content */}
      <div className="order-details-info-box">
        <div className="store-detail-box">
          <span className="order-details-store-title">{shopName}</span>
          <span className="order-details-shipping-name">{shippingMethod}</span>
        </div>
      </div>
      <div className="order-details-info-box">
        {items.map(function (item) {
          return <CompletedOrderItem item={item} key={item._id} handleDisplayMedia={handleDisplayMedia} />;
        })}
      </div>

      {/* This is the left side / main content */}
    </div>
  );
};

CompletedShopOrders.propTypes = {
  handleDisplayMedia: PropTypes.func,
  items: PropTypes.array,
  order: PropTypes.object,
  shippingMethod: PropTypes.string,
  shopName: PropTypes.string
};

registerComponent("CompletedShopOrders", CompletedShopOrders);

export default CompletedShopOrders;
