import React from "react";
import PropTypes from "prop-types";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";

/**
 * @summary Displays the order summary for each shop
 * @param {Object} props - React PropTypes
 * @property {Object} shopSummary - An object representing the summary information for this Shop
 * @property {boolean} isProfilePage - Checks if current page is profile page (unused)
 * @return {Node} React node containing the summary information for each shop
 */
const ShopOrderSummary = ({ shopSummary }) => (
  <div className="order-details-info-box-content">
    <div className="order-summary-line">
      <div className="order-summary-header-line" />
      <div className="order-summary-store-name">
        <Components.Translation defaultValue="Fulfilled by" i18nKey={"cartCompleted.fulfilledBy"}/> {shopSummary.name}
      </div>
    </div>
    <div className="order-summary-line">
      <div className="order-summary-title">
        <Components.Translation defaultValue="Items in order" i18nKey={"cartCompleted.orderItems"}/>
      </div>
      <div className="order-summary-value">{shopSummary.quantityTotal}</div>
    </div>
    <div className="order-summary-line">
      <div className="order-summary-title">
        <Components.Translation defaultValue="Subtotal" i18nKey={"cartCompleted.orderSubtotal"}/>
      </div>
      <div className="order-summary-value">
        <Components.Currency amount={shopSummary.subTotal}/>
      </div>
    </div>
    {shopSummary.shipping > 0 &&
      <div className="order-summary-line">
        <div className="order-summary-title">
          <Components.Translation defaultValue="Shipping" i18nKey={"cartCompleted.orderShipping"}/>
        </div>
        <div className="order-summary-value">
          <Components.Currency amount={shopSummary.shipping}/>
        </div>
      </div>
    }
    {shopSummary.taxes > 0 &&
      <div className="order-summary-line">
        <div className="order-summary-title">
          <Components.Translation defaultValue="Tax" i18nKey={"cartCompleted.orderTax"}/>
        </div>
        <div className="order-summary-value">
          <Components.Currency amount={shopSummary.taxes}/>
        </div>
      </div>
    }
  </div>
);

ShopOrderSummary.propTypes = {
  isProfilePage: PropTypes.bool,
  shopSummary: PropTypes.object
};

registerComponent("ShopOrderSummary", ShopOrderSummary);

export default ShopOrderSummary;
