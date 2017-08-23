import React from "react";
import PropTypes from "prop-types";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";
import ShopOrderSummary from "./shopOrderSummary";


const CompletedOrderSummary = ({ shops, orderSummary }) => {
  return (
    <div>
      <div className="order-details-content-title">
        <Components.Translation defaultValue="Your Cart" i18nKey={"cartCompleted.yourCart"} />
      </div>
      <div className="order-details-info-box">
        {shops.map((shop) => {
          const shopKey = Object.keys(shop);
          return <ShopOrderSummary shopSummary={shop[shopKey]} key={shopKey} />;
        })}
        <div className="order-summary-line">
          <div className="order-summary-total-title">
            <Components.Translation defaultValue="Order Total" i18nKey={"cartCompleted.orderTotal"}/>
          </div>
          <div className="order-summary-total-value">
            <Components.Currency amount={orderSummary.total}/>
          </div>
        </div>
      </div>
    </div>
  );
};

CompletedOrderSummary.propTypes = {
  orderSummary: PropTypes.object,
  shops: PropTypes.array
};

registerComponent("CompletedOrderSummary", CompletedOrderSummary);

export default CompletedOrderSummary;
