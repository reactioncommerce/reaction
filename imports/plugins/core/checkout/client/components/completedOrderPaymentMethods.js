import React from "react";
import PropTypes from "prop-types";
import { registerComponent } from "@reactioncommerce/reaction-components";

const creditCardClasses = {
  VISA: "fa fa-cc-visa",
  MAST: "fa fa-cc-mastercard",
  DISC: "fa fa-cc-discover",
  AMEX: "fa fa-cc-amex"
};

const CompletedOrderPaymentMethod = ({ paymentMethod }) => {
  if (paymentMethod.method === "credit") {
    const creditCardType = paymentMethod.storedCard.substring(0, 4).toUpperCase();
    const creditCardClass = creditCardClasses[creditCardType];
    return <div className="order-details-info-box">
      <div className="order-details-info-box-content">
        <p className="order-details-payment-method"><i className={creditCardClass} /> &nbsp;&nbsp;{paymentMethod.storedCard}</p>
      </div>
    </div>;
  }
  return <div className="order-details-info-box">
    <div className="order-details-info-box-content">
      <p className="order-details-payment-method">{paymentMethod.method}</p>
    </div>
  </div>;
};

CompletedOrderPaymentMethod.propTypes = {
  paymentMethod: PropTypes.object
};

registerComponent("CompletedOrderPaymentMethod", CompletedOrderPaymentMethod);

export default CompletedOrderPaymentMethod;
