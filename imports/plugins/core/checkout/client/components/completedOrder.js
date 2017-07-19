import React from "react";
import PropTypes from "prop-types";


const CompletedOrder = ({ order }) => {
  return (
    <div>
      <div className="panel panel-default order-list-detail">
        <div className="panel-heading">
          <h3 className="panel-title">
            <span data-i18n="order.placed">Placed</span>
            <span>orderAsge</span>
            <span data-i18n="order.on">on</span>
            <span>order Date</span>
            <span className="pull-right"><b>Order ID</b>: {order._id}</span>
          </h3>
        </div>
      </div>

      <div className="panel-body">
        <div className="row">
          <div className="col-xs-6 col-sm-2">
            <strong>
              <span data-i18n="order.status">Status</span>
            </strong>
          </div>
          <div className="col-xs-6 col-sm-10">
            <span data-i18n="order.completed">Completed</span>
          </div>
        </div>
      </div>
      <div className="row order-address-info">
        <div className="col-xs-6 col-sm-2">
          <strong>
            <span data-i18n="order.destination">Destination</span>
          </strong>
        </div>
        <div className="col-xs-10">
          <span>
            <address>
              Address Here
            </address>
          </span>
        </div>
      </div>

      <div className="row order-shipment-info">
        <div className="col-xs-6 col-sm-2">
          <strong>
            <span data-i18n="order.shipment">Shipment</span>
          </strong>
        </div>
        <div className="col-xs-10">
          shippingmethod.carrier - shippment.label
        </div>
      </div>

      <div className="row order-payment-info">
        <div className="col-xs-6 col-sm-2">
          <strong>
            <span data-i18n="order.payment">Payment</span>
          </strong>
        </div>
        <div className="col-xs-10">
          <span id="order-payment-method">paymentMethod.storedCard</span>
          <span data-id="order.reference">Ref:</span>
          <span id="order-payment-transaction">paymentMethod.transactionId</span>
        </div>
      </div>

      <div className="row order-group-title">
        <div className="col-xs-12">
          <strong>
            <span id="order-item-count">itemCount</span>
            <span data-i18n="order.itemsFrom">item(s) from</span>
            <span id="order-group-name">shopName</span>
          </strong>
        </div>
      </div>

      <div className="row order-list-items">
        <div className="col-xs-12">
          Order List Items Go Here
        </div>
      </div>

    </div>
  );
};

CompletedOrder.propTypes = {
  order: PropTypes.object
};

export default CompletedOrder;
