import React from "react";
import PropTypes from "prop-types";
import CompletedOrderItem from "./completedOrderItem";


const CompletedOrder = ({ order, items }) => {
  const hasEmail = !!order.email;
  return (
    <div className="container order-completed">
      <div className="order-details-header">
        {/* This is the left side / main content */}
        <h3><span data-i18n="cartCompleted.thankYou">Thank You!</span></h3>
        <p><strong>Order ID </strong>{order._id}</p>
        {hasEmail && <p>Order updates will be sent to {order.email}</p>}

        <h4>Your Items</h4>
        {/* This is the left side / main content*/}
      </div>

      <div className="order-details-main">
        {/* This is the left side / main content, with the background: #ff0000; */}
        <div className="order-details-info-box">
          <h4 className="order-details-store-title">Shoe Box</h4>
          <div>Free Shipping - estimated delivery 06/17/16</div>
        </div>
        <div className="order-details-info-box">
          {items.map(function (item) {
            return <CompletedOrderItem item={item} key={item._id} />
          })}
        </div>

        {/* This is the left side / main content, with the background: #ff0000; */}
      </div>

      <div className="order-details-side">
        {/* This is the right side / side content, with the background: #ff00ff; */}
        <div className="order-details-content-title">Shipping Address</div>
        <div className="order-details-info-box">
          <div className="order-details-info-box-content">
            <p>2139 Valentine St.</p>
            <p>Los Angeles, CA 90025 US</p>
          </div>
        </div>

        <div className="order-details-content-title">Payment Method</div>
        <div className="order-details-info-box">
          <p>Visa 4111</p>
        </div>

        <div className="order-details-info-box">
          <div className="order-details-line">
            <div className="order-summary-title">Quantity Total</div>
            <div className="order-summary-value">8</div>
          </div>
          <div className="order-details-line">
            <div className="order-summary-title">Subtotal</div>
            <div className="order-summary-value">$750</div>
          </div>
          <div className="order-details-line">
            <div className="order-summary-title">Shipping</div>
            <div className="order-summary-value">$10.00</div>
          </div>
          <div className="order-details-line">
            <div className="order-summary-title">Tax</div>
            <div className="order-summary-value">$3.33</div>
          </div>
          <hr/>
          <div className="order-details-line">
            <div className="order-summary-total-title">CAPTURED TOTAL</div>
            <div className="order-summary-total-value">$770.00</div>
          </div>
        </div>
        {/* This is the right side / side content, with the background: #ff00ff; */}
      </div>

    </div>
  );
};

CompletedOrder.propTypes = {
  items: PropTypes.array,
  order: PropTypes.object

};

export default CompletedOrder;
