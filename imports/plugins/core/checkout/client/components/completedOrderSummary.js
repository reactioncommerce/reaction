import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";
import ShopOrderSummary from "./shopOrderSummary";


/**
 * @summary Display the summary/total information for an order
 * @memberof Components
 * @param {Object} props - React PropTypes
 * @property {Array} shops - An array of summary information broken down by shop
 * @property {Object} orderSummary - An object representing the "bottom line" summary for the order
 * @returns {Node} React node containing the order summary broken down by shop
 */
class CompletedOrderSummary extends Component {
  static propTypes = {
    fulfillmentGroups: PropTypes.arrayOf(PropTypes.shape({
      _id: PropTypes.string.isRequired,
      invoice: PropTypes.shape({
        discounts: PropTypes.number.isRequired,
        shipping: PropTypes.number.isRequired,
        subtotal: PropTypes.number.isRequired,
        taxes: PropTypes.number.isRequired,
        total: PropTypes.number.isRequired
      }).isRequired,
      items: PropTypes.arrayOf(PropTypes.shape({
        quantity: PropTypes.number.isRequired
      })),
      shopName: PropTypes.string.isRequired
    }))
  };

  render() {
    const { fulfillmentGroups } = this.props;

    const discountTotal = fulfillmentGroups.reduce((sum, group) => sum + group.invoice.discounts, 0);
    const surchargeTotal = fulfillmentGroups.reduce((sum, group) => sum + group.invoice.surcharges, 0);
    const orderTotal = fulfillmentGroups.reduce((sum, group) => sum + group.invoice.total, 0);

    return (
      <div>
        <div className="order-details-content-title">
          <p><Components.Translation defaultValue="Order Summary" i18nKey={"cartCompleted.orderSummary"} /></p>
        </div>
        <div className="order-details-info-box">
          {fulfillmentGroups.map((group) => (
            <ShopOrderSummary
              key={group._id}
              quantityTotal={group.totalItemQuantity}
              shipping={group.invoice.shipping}
              shopName={group.shopName}
              subTotal={group.invoice.subtotal}
              taxes={group.invoice.taxes}
            />
          ))}
          <hr />
          {discountTotal > 0 &&
            <div className="order-summary-line">
              <div className="order-summary-discount-title">
                <Components.Translation defaultValue="Discount Total" i18nKey={"cartCompleted.discountTotal"}/>
              </div>
              <div className="order-summary-discount-value">
                <Components.Currency amount={discountTotal}/>
              </div>
            </div>
          }
          {surchargeTotal > 0 &&
            <div className="order-summary-line">
              <div className="order-summary-surcharge-title">
                <Components.Translation defaultValue="Surcharge Total" i18nKey={"cartCompleted.surchargeTotal"}/>
              </div>
              <div className="order-summary-surcharge-value">
                <Components.Currency amount={surchargeTotal}/>
              </div>
            </div>
          }
          <div className="order-summary-line">
            <div className="order-summary-total-title">
              <Components.Translation defaultValue="Order Total" i18nKey={"cartCompleted.orderTotal"}/>
            </div>
            <div className="order-summary-total-value">
              <Components.Currency amount={orderTotal}/>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

registerComponent("CompletedOrderSummary", CompletedOrderSummary);

export default CompletedOrderSummary;
