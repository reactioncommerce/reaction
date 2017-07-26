import React from "react";
import PropTypes from "prop-types";


const CompletedOrder = (order) => {

  return (
    <div className="container order-completed">
      <div className="order-details-header">
        {/* This is the left side / main content, with the background: #00ff00; */}
        <h3><span data-i18n="cartCompleted.thankYou">Thank You!</span></h3>

        <p>Order updates will be sent to ryan@reactioncommerce.com</p>
        <h4>Your Items</h4>
        {/* This is the left side / main content, with the background: #00ff00; */}
      </div>

      <div className="order-details-main">
        {/* This is the left side / main content, with the background: #ff0000; */}
        <div className="order-details-info-box">
          {/* class "order-details-info-box" has the background #0000ff; */}
          <h4 className="order-details-store-title">Shoe Box</h4>
          <div>Free Shipping - estimated delivery 06/17/16</div>
          {/* class "order-details-info-box" has the background #0000ff; */}
        </div>

        <div className="order-details-info-box">
          <div className="row order-details-line">
            <div className="order-details-line order-details-media"><img src="/resources/placeholder.gif" /></div>
            <div className="order-details-line order-details-title">Air Max</div>
            <div className="order-details-line order-details-quantity">2</div>
            <div className="order-details-line order-details-price">$250.00</div>
          </div>
          <div className="row order-details-line">
            <div className="order-details-line order-details-media"><img src="/resources/placeholder.gif" /></div>
            <div className="order-details-line order-details-title">Air Max</div>
            <div className="order-details-line order-details-quantity">2</div>
            <div className="order-details-line order-details-price">$250.00</div>
          </div>
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
  order: PropTypes.object
};

export default CompletedOrder;
