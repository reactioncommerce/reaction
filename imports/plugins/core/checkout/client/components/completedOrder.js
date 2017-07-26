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
          <p>Info</p>
          <p>Info</p>
          <p>Info</p>
          <p>Info</p>
          <h4>Shoe Box</h4>
          <div>Free Shipping - estimated delivery 06/17/16</div>
          {/* class "order-details-info-box" has the background #0000ff; */}
        </div>

        <div className="order-details-info-box">
          <p>Info</p>
          <p>Info</p>
          <p>Info</p>
          <p>Info</p>
          <div className="order-completed-line-item">
            <div className="order-item-media"><img src="/resources/placeholder.gif" /></div>
            <div className="order-details-title">Air Max</div>
            <div className="order-details-quantity">2</div>
            <div className="order-details-price">$250.00</div>
          </div>
        </div>

        <div className="order-details-info-box">
          <p>Info</p>
          <p>Info</p>
          <p>Info</p>
          <p>Info</p>
        </div>
        {/* This is the left side / main content, with the background: #ff0000; */}
      </div>

      <div className="order-details-side">
      {/* This is the right side / side content, with the background: #ff00ff; */}
        <div className="order-details-info-box">
          <p>Info</p>
          <p>Info</p>
          <p>Info</p>
          <p>Info</p>
        </div>

        <div className="order-details-info-box">
          <p>Info</p>
          <p>Info</p>
          <p>Info</p>
          <p>Info</p>
        </div>

        <div className="order-details-info-box">
          <p>Info</p>
          <p>Info</p>
          <p>Info</p>
          <p>Info</p>
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
