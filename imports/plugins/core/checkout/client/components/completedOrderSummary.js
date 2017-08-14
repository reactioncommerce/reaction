import React from "react";
import PropTypes from "prop-types";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";


const CompletedOrderSummary = ({ orderSummary }) => {
  return <div className="order-details-info-box">
    <div className="order-details-info-box-content">
      <div className="order-summary-line">
        <div className="order-summary-title">
          <Components.Translation defaultValue="Quantity Total" i18nKey={"cartCompleted.quantityTotal"}/>
        </div>
        <div className="order-summary-value">{orderSummary.quantityTotal}</div>
      </div>
      <div className="order-summary-line">
        <div className="order-summary-title">
          <Components.Translation defaultValue="Subtotal" i18nKey={"cartCompleted.orderSubtotal"} />
        </div>
        <div className="order-summary-value">
          <Components.Currency amount={orderSummary.subtotal} />
        </div>
      </div>
      <div className="order-summary-line">
        <div className="order-summary-title">
          <Components.Translation defaultValue="Shipping" i18nKey={"cartCompleted.orderShipping"} />
        </div>
        <div className="order-summary-value">
          <Components.Currency amount={orderSummary.shipping} />
        </div>
      </div>
      <div className="order-summary-line">
        <div className="order-summary-title">
          <Components.Translation defaultValue="Tax" i18nKey={"cartCompleted.orderTax"} />
        </div>
        <div className="order-summary-value">
          <Components.Currency amount={orderSummary.tax} />
        </div>
      </div>
      <hr/>
      <div className="order-summary-line">
        <div className="order-summary-total-title">
          <Components.Translation defaultValue="Captured Total" i18nKey={"cartCompleted.orderTotal"} />
        </div>
        <div className="order-summary-total-value">
          <Components.Currency amount={orderSummary.total} />
        </div>
      </div>
    </div>
  </div>;
};

CompletedOrderSummary.propTypes = {
  orderSummary: PropTypes.object
};

registerComponent("CompletedOrderSummary", CompletedOrderSummary);

export default CompletedOrderSummary;
