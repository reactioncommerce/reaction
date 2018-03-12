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
 * @property {Array} shops - An Array contains information broken down by shop
 * @property {Object} orderSummary - An object containing the items making up the order summary
 * @property {Array} paymentMethod - An array of paymentMethod objects
 * @property {Booleam} isProfilePage - A boolean value that checks if current page is user profile page
 * @return {Node} React node containing the top-level component for displaying the completed order/receipt page
 */
const CompletedOrder = ({ order, shops, orderSummary, paymentMethods, isProfilePage }) => {
  if (!order) {
    return (
      <Components.NotFound
        i18nKeyTitle="order.notFound"
        icon="fa fa-barcode"
        title="Order Not Found"
      />
    );
  }

  let headerText;

  if (isProfilePage) {
    headerText = (<p className="order-id"><strong>Order ID </strong>{order._id}</p>);
  } else {
    headerText = (
      <div className="order-details-header">
        {/* This is the left side / main content */}
        <h3><Components.Translation defaultValue="Thank You" i18nKey={"cartCompleted.thankYou"} /></h3>
        <p><strong>Order ID </strong>{order._id}</p>
        {/* show a different message depending on whether we have an email or not */}
        <AddEmail order={order} orderEmail={order.email} />
        {/* This is the left side / main content*/}
      </div>
    );
  }

  return (
    <div className="container order-completed">
      { headerText }
      <div className="order-details-main">
        <div className="order-details-content-title">
          <p><Components.Translation defaultValue="Your Items" i18nKey={"cartCompleted.yourItems"} /></p>
        </div>
        {shops.map((shop) => {
          const shopKey = Object.keys(shop);
          return (
            <CompletedShopOrders
              shopName={shop[shopKey].name}
              items={shop[shopKey].items}
              key={shopKey}
              shippingMethod={shop[shopKey].shippingMethod}
              isProfilePage={isProfilePage}
            />
          );
        })}
      </div>

      <div className="order-details-side">

        {/* This is the right side / side content */}
        <div className="shipping-payment-details">
          <div className="shipping-info">
            <div className="order-details-content-title">
              <p> <Components.Translation defaultValue="Shipping Address" i18nKey={"cartCompleted.shippingAddress"} /></p>
            </div>
            {orderSummary.shipping.map((shipment) => {
              if (shipment.address.fullName || shipment.address.address1) {
                return <div className="order-details-info-box" key={shipment._id}>
                  <div className="order-details-info-box-content">
                    <p>
                      {shipment.address.fullName}<br/>
                      {shipment.address.address1} {shipment.address.address2}<br/>
                      {shipment.address.city}, {shipment.address.region} {shipment.address.postal} {shipment.address.country}
                    </p>
                  </div>
                </div>;
              }
              return null;
            })}
          </div>

          <div className="payment-info">
            <div className="order-details-content-title">
              <p><Components.Translation defaultValue="Payment Method" i18nKey={"cartCompleted.paymentMethod"} /></p>
            </div>
            {paymentMethods.map((paymentMethod) => <CompletedOrderPaymentMethod key={paymentMethod.key} paymentMethod={paymentMethod} />)}
          </div>
        </div>
        <CompletedOrderSummary shops={shops} orderSummary={orderSummary} isProfilePage={isProfilePage} />
        {/* This is the right side / side content */}
      </div>

    </div>
  );
};

CompletedOrder.propTypes = {
  isProfilePage: PropTypes.bool,
  order: PropTypes.object,
  orderSummary: PropTypes.object,
  paymentMethods: PropTypes.array,
  shops: PropTypes.array
};

export default CompletedOrder;
