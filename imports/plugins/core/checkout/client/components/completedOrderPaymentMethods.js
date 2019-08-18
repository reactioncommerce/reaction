import React from "react";
import PropTypes from "prop-types";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";

const creditCardClasses = {
  VISA: "fa fa-cc-visa",
  MAST: "fa fa-cc-mastercard",
  DISC: "fa fa-cc-discover",
  AMEX: "fa fa-cc-amex"
};

/**
 * @summary Displays one of possibly many payment methods on an order
 * @memberof Components
 * @param {Object} props - React PropTypes
 * @property {Object} paymentMethod - An object representing the payment method
 * @returns {Node} React node containing each payment method
 */
const CompletedOrderPaymentMethod = ({ paymentMethod }) => {
  const { cardBrand, displayName, processor } = paymentMethod;

  // display stored card methods
  if (cardBrand) {
    const creditCardType = cardBrand.toUpperCase();
    const creditCardClass = creditCardClasses[creditCardType];
    return (
      <div className="order-details-info-box">
        <div className="order-details-info-box-content">
          <p className="order-details-payment-method"><i className={creditCardClass} /> &nbsp;&nbsp;{displayName}</p>
        </div>
      </div>
    );
  }

  // allow i18n override for "processor" label
  const i18nKey = `checkout.paymentMethod.${processor}`;

  return (
    <div className="order-details-info-box">
      <div className="order-details-info-box-content">
        <p className="order-details-payment-method">
          <Components.Translation defaultValue={processor} i18nKey={i18nKey} />
        </p>
      </div>
    </div>
  );
};

CompletedOrderPaymentMethod.propTypes = {
  paymentMethod: PropTypes.object
};

registerComponent("CompletedOrderPaymentMethod", CompletedOrderPaymentMethod);

export default CompletedOrderPaymentMethod;
