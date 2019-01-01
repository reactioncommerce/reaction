import React, { Component } from "react";
import PropTypes from "prop-types";
import { formatPriceString } from "/client/api";

const displayStatuses = {
  created: "Awaiting approval",
  approved: "Approved",
  completed: "Captured",
  error: "Error",
  refunded: "Fully refunded",
  partialRefund: "Partially refunded"
};

export default class OrderPayment extends Component {
  static propTypes = {
    payment: PropTypes.shape({
      _id: PropTypes.string.isRequired
    }).isRequired
  };

  renderStatus(status) {
    return displayStatuses[status];
  }

  render() {
    const { payment } = this.props;

    return (
      <div key={payment._id} className="order-payment-list-item">
        <div><strong>{payment.displayName}</strong></div>
        <div><strong data-i18n="order.processor">Processor: </strong> {payment.processor}</div>
        <div><strong data-i18n="order.transaction">Transaction ID:</strong> {payment.transactionId}</div>
        <div><strong data-i18n="order.amount">Amount:</strong> {formatPriceString(payment.amount)}</div>
        <div><strong data-i18n="order.status">Status:</strong> {this.renderStatus(payment.status)}</div>
      </div>
    );
  }
}
