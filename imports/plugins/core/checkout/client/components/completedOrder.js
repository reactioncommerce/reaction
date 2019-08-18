import React from "react";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";
import CompletedShopOrders from "./completedShopOrders";
import CompletedOrderPaymentMethod from "./completedOrderPaymentMethods";
import CompletedOrderSummary from "./completedOrderSummary";

/**
 * @summary Displays a summary/information about the order the user has just completed
 * @memberof Components
 * @param {Object} props - React PropTypes
 * @property {Object} order - An object representing the order
 * @property {Array} paymentMethods - An array of paymentMethod objects
 * @property {Boolean} isProfilePage - A boolean value that checks if current page is user profile page
 * @returns {Node} React node containing the top-level component for displaying the completed order/receipt page
 */
const CompletedOrder = ({ order, paymentMethods, isProfilePage }) => {
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
    headerText = (<p className="order-id"><strong>Order ID </strong>{order.referenceId}</p>);
  } else {
    headerText = (
      <div className="order-details-header">
        {/* This is the left side / main content */}
        <h3><Components.Translation defaultValue="Thank You" i18nKey={"cartCompleted.thankYou"} /></h3>
        <p><strong>Order ID </strong>{order.referenceId}</p>
        <p>
          <Components.Translation defaultValue="Order updates will be sent to" i18nKey="cartCompleted.trackYourDelivery" />
          &nbsp;<strong>{order.email}</strong>
        </p>
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
        {order.shipping.map((group) => (
          <CompletedShopOrders
            isProfilePage={isProfilePage}
            items={group.items}
            key={group._id}
            shippingMethod={group.shipmentMethod}
            shopName={group.shopName}
          />
        ))}
      </div>

      <div className="order-details-side">

        {/* This is the right side / side content */}
        <div className="shipping-payment-details">
          <div className="shipping-info">
            <div className="order-details-content-title">
              <p> <Components.Translation defaultValue="Shipping Address" i18nKey={"cartCompleted.shippingAddress"} /></p>
            </div>
            {order.shipping.map((group) => {
              if (group.address.fullName || group.address.address1) {
                return <div className="order-details-info-box" key={group._id}>
                  <div className="order-details-info-box-content">
                    <p>
                      {group.address.fullName}<br/>
                      {group.address.address1} {group.address.address2}<br/>
                      {group.address.city}, {group.address.region} {group.address.postal} {group.address.country}
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
        <CompletedOrderSummary fulfillmentGroups={order.shipping} />
        {/* This is the right side / side content */}
      </div>

    </div>
  );
};

CompletedOrder.propTypes = {
  isProfilePage: PropTypes.bool,
  order: PropTypes.object,
  paymentMethods: PropTypes.array
};

export default CompletedOrder;
