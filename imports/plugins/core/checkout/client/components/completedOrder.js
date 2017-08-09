import React from "react";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";
import CompletedShopOrders from "./completedShoporders";


const CompletedOrder = ({ order, shops, orderSummary, handleDisplayMedia }) => {
  const shippingAddress = order.shipping[0].address;
  const hasEmail = !!order.email;
  return (
    <div className="container order-completed">
      <div className="order-details-header">
        {/* This is the left side / main content */}
        <h3><Components.Translation defaultValue="Thank You" i18nKey={"cartCompleted.thankYou"} /></h3>
        <p><strong>Order ID </strong>{order._id}</p>
        {/* show a different message depending on whether we have an email or not */}
        {hasEmail && <p><Components.Translation defaultValue="Order updates will be sent to" i18nKey={"cartCompleted.trackYourDelivery"} /> {order.email}</p>}
        {!hasEmail && <p><Components.Translation defaultValue="Hello! Add an email and receive order updates." i18nKey={"cartCompleted.registerGuest"} /></p>}
        <h4><strong><Components.Translation defaultValue="Your Items" i18nKey={"cartCompleted.yourItems"} /></strong></h4>
        {/* This is the left side / main content*/}
      </div>

      {shops.map(function (shop) {
        const shopKey = Object.keys(shop);
        return <CompletedShopOrders
          shopName={shop[shopKey].name}
          items={shop[shopKey].items}
          key={shop}
          order={order}
          handleDisplayMedia={handleDisplayMedia}
        />;
      })};

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
        <div className="order-details-info-box">
          <p>Visa 4111</p>
        </div>

        <div className="order-details-info-box">
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
        {/* This is the right side / side content */}
      </div>

    </div>
  );
};

CompletedOrder.propTypes = {
  handleDisplayMedia: PropTypes.func,
  order: PropTypes.object,
  orderSummary: PropTypes.object,
  shops: PropTypes.array
};

export default CompletedOrder;
