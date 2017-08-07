import React from "react";
import PropTypes from "prop-types";

const CompletedOrderItem = ({ item }) => {
  return (
    <div className="row order-details-line">
      <div className="order-details-line order-details-media"><img src="/resources/placeholder.gif" /></div>
      <div className="order-details-line order-details-title">{item.variants.title}</div>
      <div className="order-details-line order-details-quantity">{item.quantity}</div>
      <div className="order-details-line order-details-price">{item.price}</div>
    </div>
  );
};


CompletedOrderItem.propTypes = {
  item: PropTypes.object
};

export default CompletedOrderItem;
