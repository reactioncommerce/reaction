import React from "react";
import PropTypes from "prop-types";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";

const ShopOrderSummary = ({ shopSummary }) => {
  return (
    <div className="order-details-info-box-content">
      <div className="order-summary-line">
        <div className="order-summary-header-line"> </div>
        <div className="order-summary-store-name">
          <Components.Translation defaultValue="Order placed by" i18nKey={"cartCompleted.orderPlacedBy"}/> {shopSummary.name.toLowerCase()}
        </div>
      </div>
      <div className="order-summary-line">
        <div className="order-summary-title">
          <Components.Translation defaultValue="Quantity Total" i18nKey={"cartCompleted.quantityTotal"}/>
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
};

ShopOrderSummary.propTypes = {
  shopSummary: PropTypes.object
};

registerComponent("ShopOrderSummary", ShopOrderSummary);

export default ShopOrderSummary;
