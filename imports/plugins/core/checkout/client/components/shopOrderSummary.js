import React from "react";
import PropTypes from "prop-types";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";

const ShopOrderSummary = ({ shopSummary }) => {
  const shopKey = Object.keys(shopSummary);
  const shopSummaryData = shopSummary[shopKey];
  return (
    <div className="order-details-info-box-content">
      <div className="order-summary-line">
        <div className="order-summary-title">
          <Components.Translation defaultValue="Quantity Total" i18nKey={"cartCompleted.quantityTotal"}/>
        </div>
        <div className="order-summary-value">{shopSummaryData.quantityTotal}</div>
      </div>
      <div className="order-summary-line">
        <div className="order-summary-title">
          <Components.Translation defaultValue="Subtotal" i18nKey={"cartCompleted.orderSubtotal"}/>
        </div>
        <div className="order-summary-value">
          <Components.Currency amount={shopSummaryData.subTotal}/>
        </div>
      </div>
      <div className="order-summary-line">
        <div className="order-summary-title">
          <Components.Translation defaultValue="Shipping" i18nKey={"cartCompleted.orderShipping"}/>
        </div>
        <div className="order-summary-value">
          <Components.Currency amount={shopSummaryData.shipping}/>
        </div>
      </div>
      <div className="order-summary-line">
        <div className="order-summary-title">
          <Components.Translation defaultValue="Tax" i18nKey={"cartCompleted.orderTax"}/>
        </div>
        <div className="order-summary-value">
          <Components.Currency amount={shopSummaryData.taxes}/>
        </div>
      </div>
      <hr/>
    </div>
  );
};

ShopOrderSummary.propTypes = {
  shopSummary: PropTypes.object
};

registerComponent("ShopOrderSummary", ShopOrderSummary);

export default ShopOrderSummary;
