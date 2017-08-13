import React from "react";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";
import CompletedShopOrders from "./completedShoporders";
import CompletedOrderPaymentMethod from "./completedOrderPaymentMethods";
import CompletedOrderSummary from "./completedOrderSummary";
import AddEmail from "./addEmail";


const CompletedOrder = ({ order, orderId, shops, orderSummary, paymentMethods, handleDisplayMedia }) => {
  const { shippingAddress } = orderSummary;
  return (
    <div className="container order-completed">
      <div className="order-details-header">
        {/* This is the left side / main content */}
        <h3><Components.Translation defaultValue="Thank You" i18nKey={"cartCompleted.thankYou"} /></h3>
        <p><strong>Order ID </strong>{orderId}</p>
        {/* show a different message depending on whether we have an email or not */}
        <AddEmail order={order} orderEmail={order.email} />
        {/* This is the left side / main content*/}
      </div>

      <div className="order-details-main">
        <h4><strong><Components.Translation defaultValue="Your Items" i18nKey={"cartCompleted.yourItems"} /></strong></h4>
        {shops.map(function (shop) {
          const shopKey = Object.keys(shop);
          return <CompletedShopOrders
            shopName={shop[shopKey].name}
            items={shop[shopKey].items}
            key={shop}
            shippingMethod={orderSummary.shippingMethod}
            handleDisplayMedia={handleDisplayMedia}
          />;
        })}
      </div>

      <div className="order-details-side">

        {/* This is the right side / side content */}
        <div className="order-details-content-title">
          <Components.Translation defaultValue="Shipping Address" i18nKey={"cartCompleted.shippingAddress"} />
        </div>
        <div className="order-details-info-box">
          <div className="order-details-info-box-content">
            <p>{shippingAddress.address1}<br />
              {shippingAddress.city}, {shippingAddress.region} {shippingAddress.postal} {shippingAddress.country}</p>
          </div>
        </div>

        <div className="order-details-content-title">
          <Components.Translation defaultValue="Payment Method" i18nKey={"cartCompleted.paymentMethod"} />
        </div>
        {paymentMethods.map(function (paymentMethod) {
          return <CompletedOrderPaymentMethod key={paymentMethod.transactionId} paymentMethod={paymentMethod} />;
        })}
        <CompletedOrderSummary orderSummary={orderSummary} />
        {/* This is the right side / side content */}
      </div>

    </div>
  );
};

CompletedOrder.propTypes = {
  handleDisplayMedia: PropTypes.func,
  order: PropTypes.object,
  orderId: PropTypes.string,
  orderSummary: PropTypes.object,
  paymentMethods: PropTypes.array,
  shops: PropTypes.array
};

export default CompletedOrder;
