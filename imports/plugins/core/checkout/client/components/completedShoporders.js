import React from "react";
import PropTypes from "prop-types";
import CompletedOrderItem from "./completedOrderItem";

const CompletedShopOrders = ({ shopName, items, handleDisplayMedia, order }) => {
  const shippingMethod = order.shipping[0].shipmentMethod.carrier;
  return (
    <div className="order-details-main">
      {/* This is the left side / main content */}
      <div className="order-details-info-box">
        <div className="order-details-store-title">{shopName}<span className="order-details-shipping-name">{shippingMethod}</span>
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
  shopName: PropTypes.string
};

export default CompletedShopOrders;
