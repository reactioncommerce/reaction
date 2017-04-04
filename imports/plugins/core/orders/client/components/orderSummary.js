import React, { Component } from "react";

class OrderSummary extends Component {
  render() {
    return (
      <div>
         <div className="core-order-created">
          <strong  data-i18n="order.created">Created</strong>
        </div>

        <div className="core-order-processor">
          <strong data-i18n="order.processor">Processor</strong>
        </div>

        <div className="core-order-reference">
          <strong data-i18n="order.reference">Reference</strong>

        </div>

        <div>
          <strong data-i18n="orderShipping.carrier">Carrier</strong>

        </div>

        <div>
          <strong data-i18n="orderShipping.tracking">Tracking</strong>

        </div>
      </div>
    );
  }
}

export default OrderSummary;
