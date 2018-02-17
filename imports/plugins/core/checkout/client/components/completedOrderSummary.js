import React from "react";
import PropTypes from "prop-types";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";
import ShopOrderSummary from "./shopOrderSummary";


/**
 * @summary Display the summary/total information for an order
 * @param {Object} props - React PropTypes
 * @property {Array} shops - An array of summary information broken down by shop
 * @property {Object} orderSummary - An object representing the "bottom line" summary for the order
 * @property {boolean} isProfilePage - Checks if current page is Profile Page
 * @return {Node} React node containing the order summary broken down by shop
 */
const CompletedOrderSummary = ({ shops, orderSummary, isProfilePage }) => (
  <div>
    <div className="order-details-content-title">
      <p><Components.Translation defaultValue="Order Summary" i18nKey={"cartCompleted.orderSummary"} /></p>
    </div>
    <div className="order-details-info-box">
      {shops.map((shop) => {
        const shopKey = Object.keys(shop);
        return <ShopOrderSummary shopSummary={shop[shopKey]} key={shopKey} isProfilePage={isProfilePage} />;
      })}
      <hr />
      {orderSummary.discounts > 0 &&
        <div className="order-summary-line">
          <div className="order-summary-discount-title">
            <Components.Translation defaultValue="Discount Total" i18nKey={"cartCompleted.discountTotal"}/>
          </div>
          <div className="order-summary-discount-value">
            <Components.Currency amount={orderSummary.discounts}/>
          </div>
        </div>
      }
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

CompletedOrderSummary.propTypes = {
  isProfilePage: PropTypes.bool,
  orderSummary: PropTypes.object,
  shops: PropTypes.array
};

registerComponent("CompletedOrderSummary", CompletedOrderSummary);

export default CompletedOrderSummary;
