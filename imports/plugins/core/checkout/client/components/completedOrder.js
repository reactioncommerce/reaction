import React from "react";
import PropTypes from "prop-types";


const CompletedOrder = (order) => {

  return (
    <div className="container order-completed">
      <div>
        <h3><span data-i18n="cartCompleted.thankYou">Thank You!</span></h3>
      </div>
      <div>
        Order updates will be sent to ryan@reactioncommerce.com
      </div>
      <div><h4>Your Items</h4></div>
      <div className="order-details-shop-status-box">
        <h4>Shoe Box</h4>
        <div>Free Shipping - estimated delivery 06/17/16</div>
      </div>
      <div className="row order-completed-item-box">
        <div className="order-completed-line-item">
          <div className="order-item-media"><img src="/resources/placeholder.gif" /></div>
          <div className="order-details-title">Air Max</div>
          <div className="order-details-quantity">2</div>
          <div className="order-details-price">$250.00</div>
        </div>
      </div>

    </div>
  );
};

CompletedOrder.propTypes = {
  order: PropTypes.object
};

export default CompletedOrder;
