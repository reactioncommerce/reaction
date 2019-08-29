import React, { Component } from "react";
import PropTypes from "prop-types";
import { getPrimaryMediaForItem } from "/lib/api";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";

/**
 * @summary Shows the individual line items for a completed order
 * @memberof Components
 * @param {Object} props - React PropTypes
 * @property {Object} item - An object representing each item on the order
 * @returns {Node} React node containing each line item on an order
 */
class CompletedOrderItem extends Component {
  static propTypes = {
    item: PropTypes.shape({
      price: PropTypes.shape({
        amount: PropTypes.number.isRequired
      }).isRequired,
      quantity: PropTypes.number.isRequired,
      title: PropTypes.string.isRequired,
      variantTitle: PropTypes.string.isRequired
    })
  };

  render() {
    const { item } = this.props;

    return (
      <div className="row order-details-line">
        <div className="order-details-media">
          <Components.ProductImage
            badge={false}
            displayMedia={getPrimaryMediaForItem}
            item={item}
            size="small"
          />
        </div>
        <div className="order-details-title">{item.title}<p>{item.variantTitle}</p></div>
        <div className="order-details-quantity"><span>{item.quantity}</span></div>
        <div className="order-details-price"><Components.Currency amount={item.price.amount} /></div>
      </div>
    );
  }
}

registerComponent("CompletedOrderItem", CompletedOrderItem);

export default CompletedOrderItem;
