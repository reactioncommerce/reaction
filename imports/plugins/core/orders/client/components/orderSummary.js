import React, { Component, PropTypes } from "react";

class OrderSummary extends Component {
  static propTypes = {
    dateFormat: PropTypes.func,
    order: PropTypes.object,
    shipmentStatus: PropTypes.func,
    tracking: PropTypes.func
  }

  render() {
    const { dateFormat, tracking, order, shipmentStatus } = this.props;

    return (
      <div>
        {shipmentStatus().status === "success" ?
          <span className="badge badge-success">{shipmentStatus().label}</span> :
           <span className="badge badge-info">{shipmentStatus().label}</span>
        }
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
