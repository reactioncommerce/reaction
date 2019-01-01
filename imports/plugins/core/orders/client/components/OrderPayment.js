import React, { Component } from "react";
import PropTypes from "prop-types";
import { withComponents } from "@reactioncommerce/components-context";
import { CustomPropTypes } from "@reactioncommerce/components/utils";
import { formatPriceString, i18next } from "/client/api";

const displayStatuses = {
  created: "Awaiting approval",
  approved: "Approved",
  completed: "Captured",
  error: "Error",
  refunded: "Fully refunded",
  partialRefund: "Partially refunded"
};

class OrderPayment extends Component {
  static propTypes = {
    /**
     * If you've set up a components context using
     * [@reactioncommerce/components-context](https://github.com/reactioncommerce/components-context)
     * (recommended), then this prop will come from there automatically. If you have not
     * set up a components context or you want to override one of the components in a
     * single spot, you can pass in the components prop directly.
     */
    components: PropTypes.shape({
      /**
       * Button component used for payment buttons
       */
      Button: CustomPropTypes.component.isRequired
    }),
    /**
     * Function to be called when "Approve" is clicked for a payment
     */
    onApprovePayment: PropTypes.func,
    payment: PropTypes.shape({
      _id: PropTypes.string.isRequired
    }).isRequired
  };

  state = {
    isApproving: false
  }

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  handleClickApprove = async () => {
    const { onApprovePayment, payment } = this.props;

    this.setState({ isApproving: true });

    await onApprovePayment(payment._id);

    if (this._isMounted) this.setState({ isApproving: false });
  }

  renderStatus(status) {
    return displayStatuses[status];
  }

  render() {
    const { components: { Button }, payment } = this.props;
    const { isApproving } = this.state;

    return (
      <div key={payment._id} className="order-payment-list-item">
        <div><strong>{payment.displayName}</strong></div>
        <div><strong data-i18n="order.processor">Processor: </strong> {payment.processor}</div>
        <div><strong data-i18n="order.transaction">Transaction ID:</strong> {payment.transactionId}</div>
        <div><strong data-i18n="order.amount">Amount:</strong> {formatPriceString(payment.amount)}</div>
        <div><strong data-i18n="order.status">Status:</strong> {this.renderStatus(payment.status)}</div>
        <div className="order-payment-action-area">{["created", "adjustments"].indexOf(payment.status) > -1 ?
          <Button
            actionType="important"
            isFullWidth
            isWaiting={isApproving}
            onClick={this.handleClickApprove}
          >
            {i18next.t("order.approveInvoice")}
          </Button> : null}
        </div>
      </div>
    );
  }
}

export default withComponents(OrderPayment);
