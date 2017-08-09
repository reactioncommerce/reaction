import React from "react";
import PropTypes from "prop-types";
import CompletedOrderItem from "./completedOrderItem";

const CompletedShopOrders = ({ shopName, items, handleDisplayMedia }) => {
  return (
    <div className="order-details-main">
      {/* This is the left side / main content */}
      <div className="order-details-info-box">
        <h4 className="order-details-store-title">{shopName}</h4>
        <div>Free Shipping - estimated delivery 06/17/16</div>
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
  shopName: PropTypes.string
};

export default CompletedShopOrders;
