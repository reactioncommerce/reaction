import React from "react";
import PropTypes from "prop-types";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";

/**
 * @summary Shows the individual line items for a completed order
 * @param {Object} props - React PropTypes
 * @property {Object} item - An object representing each item on the order
 * @property {Function} handleDisplayMedia - a function for displaying the proper product image
 * @return {Node} React node containing each line item on an order
 */
const CompletedOrderItem = ({ item, handleDisplayMedia }) => {
  let image;
  if (handleDisplayMedia(item)) {
    image = handleDisplayMedia(item).url();
  } else {
    image = "/resources/placeholder.gif";
  }
  return (
    <div className="row order-details-line">
      <div className="order-details-media"><img src={image} /></div>
      <div className="order-details-title">{item.product.title}<p>{item.variants.title}</p></div>
      <div className="order-details-quantity"><span>{item.quantity}</span></div>
      <div className="order-details-price"><Components.Currency amount={item.variants.price} /></div>
    </div>
  );
};


CompletedOrderItem.propTypes = {
  handleDisplayMedia: PropTypes.func,
  item: PropTypes.object
};

registerComponent("CompletedOrderItem", CompletedOrderItem);

export default CompletedOrderItem;
