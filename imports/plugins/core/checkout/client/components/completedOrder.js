import React from "react";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";
import CompletedShopOrders from "./completedShopOrders";
import CompletedOrderPaymentMethod from "./completedOrderPaymentMethods";
import CompletedOrderSummary from "./completedOrderSummary";
import AddEmail from "./addEmail";

/**
 * @summary Displays a summary/information about the order the user has just completed
 * @param {Object} props - React PropTypes
 * @property {Object} order - An object representing the order
 * @property {String} orderID - the unique identifier of the order
 * @property {Array} shops - An Array contains information broken down by shop
 * @property {Object} orderSummary - An object containing the items making up the order summary
 * @property {Array} paymentMethod - An array of paymentMethod objects
 * @property {Function} handleDisplayMedia - A function for displaying the product image
 * @return {Node} React node containing the top-level component for displaying the completed order/receipt page
 */
const CompletedOrder = ({ order, orderId, shops, orderSummary, paymentMethods, handleDisplayMedia }) => {
  if (!order) {
    return (
      <Components.NotFound
        i18nKeyTitle="order.notFound"
        icon="fa fa-barcode"
        title="Order Not Found"
      />
    );
  }
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
        <div className="order-details-content-title">
          <Components.Translation defaultValue="Your Items" i18nKey={"cartCompleted.yourItems"} />
        </div>
        {shops.map(function (shop) {
          const shopKey = Object.keys(shop);
          return (
            <CompletedShopOrders
              shopName={shop[shopKey].name}
              items={shop[shopKey].items}
              key={shopKey}
              shippingMethod={shop[shopKey].shippingMethod}
              handleDisplayMedia={handleDisplayMedia}
            />
          );
        })}
      </div>

      <div className="order-details-side">

        {/* This is the right side / side content */}
        <div className="order-details-content-title">
          <Components.Translation defaultValue="Shipping Address" i18nKey={"cartCompleted.shippingAddress"} />
        </div>
        {orderSummary.shipping.map((shipment) => {
          if (shipment.address.fullName || shipment.address.address1) {
            return <div className="order-details-info-box" key={shipment._id}>
              <div className="order-details-info-box-content">
                <p>
                  {shipment.address.fullName}<br/>
                  {shipment.address.address1}<br/>
                  {shipment.address.city}, {shipment.address.region} {shipment.address.postal} {shipment.address.country}
                </p>
              </div>
            </div>;
          }
        })}

        <div className="order-details-content-title">
          <Components.Translation defaultValue="Payment Method" i18nKey={"cartCompleted.paymentMethod"} />
        </div>
        {paymentMethods.map(function (paymentMethod) {
          return <CompletedOrderPaymentMethod key={paymentMethod.key} paymentMethod={paymentMethod} />;
        })}
        <CompletedOrderSummary shops={shops} orderSummary={orderSummary} />
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
