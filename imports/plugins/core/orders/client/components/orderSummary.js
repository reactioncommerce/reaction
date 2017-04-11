import React, { Component, PropTypes } from "react";

class OrderSummary extends Component {
  static propTypes = {
    dateFormat: PropTypes.func,
    order: PropTypes.object,
    tracking: PropTypes.func
  }

  render() {
    const { dateFormat, tracking, order } = this.props;

    return (
      <div>
         <div className="order-summary-form-group">
          <strong data-i18n="order.created">Created</strong>
          <div className="invoice-details">
            {dateFormat(order.createdAt, "MM/D/YYYY")}
          </div>
        </div>

        <div className="order-summary-form-group">
          <strong data-i18n="order.processor">Processor</strong>
          <div className="invoice-details">
            {order.billing[0].paymentMethod.processor}
          </div>
        </div>

        <div className="order-summary-form-group">
          <strong data-i18n="orderShipping.carrier">Carrier</strong>
          <div className="invoice-details">
            {order.shipping[0].shipmentMethod.carrier} - {order.shipping[0].shipmentMethod.label}
          </div>
        </div>

        <div className="order-summary-form-group">
          <strong data-i18n="orderShipping.tracking">Tracking</strong>
          <div className="invoice-details">
            {tracking()}
          </div>
        </div>
      </div>
    );
  }
}

export default OrderSummary;
