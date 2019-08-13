import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";

/**
 * @summary Displays the order summary for each shop
 * @memberof Components
 * @param {Object} props - React PropTypes
 * @property {Object} shopSummary - An object representing the summary information for this Shop
 * @returns {Node} React node containing the summary information for each shop
 */
class ShopOrderSummary extends Component {
  static propTypes = {
    quantityTotal: PropTypes.number.isRequired,
    shipping: PropTypes.number.isRequired,
    shopName: PropTypes.string.isRequired,
    subTotal: PropTypes.number.isRequired,
    taxes: PropTypes.number.isRequired
  };

  render() {
    const { quantityTotal, shipping, shopName, subTotal, taxes } = this.props;

    return (
      <div className="order-details-info-box-content">
        <div className="order-summary-line">
          <div className="order-summary-header-line" />
          <div className="order-summary-store-name">
            <Components.Translation defaultValue="Fulfilled by" i18nKey={"cartCompleted.fulfilledBy"}/> {shopName}
          </div>
        </div>
        <div className="order-summary-line">
          <div className="order-summary-title">
            <Components.Translation defaultValue="Items in order" i18nKey={"cartCompleted.orderItems"}/>
          </div>
          <div className="order-summary-value">{quantityTotal}</div>
        </div>
        <div className="order-summary-line">
          <div className="order-summary-title">
            <Components.Translation defaultValue="Subtotal" i18nKey={"cartCompleted.orderSubtotal"}/>
          </div>
          <div className="order-summary-value">
            <Components.Currency amount={subTotal}/>
          </div>
        </div>
        {shipping > 0 &&
          <div className="order-summary-line">
            <div className="order-summary-title">
              <Components.Translation defaultValue="Shipping" i18nKey={"cartCompleted.orderShipping"}/>
            </div>
            <div className="order-summary-value">
              <Components.Currency amount={shipping}/>
            </div>
          </div>
        }
        {taxes > 0 &&
          <div className="order-summary-line">
            <div className="order-summary-title">
              <Components.Translation defaultValue="Tax" i18nKey={"cartCompleted.orderTax"}/>
            </div>
            <div className="order-summary-value">
              <Components.Currency amount={taxes}/>
            </div>
          </div>
        }
      </div>
    );
  }
}

registerComponent("ShopOrderSummary", ShopOrderSummary);

export default ShopOrderSummary;
