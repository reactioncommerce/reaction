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
    isCapturing: PropTypes.bool,
    /**
     * Function to be called when "Approve" is clicked for a payment
     */
    onApprovePayment: PropTypes.func.isRequired,
    /**
     * Function to be called when "Capture" is clicked for a payment
     */
    onCapturePayment: PropTypes.func.isRequired,
    payment: PropTypes.shape({
      _id: PropTypes.string.isRequired,
      amount: PropTypes.number.isRequired,
      captureErrorMessage: PropTypes.string,
      displayName: PropTypes.string.isRequired,
      processor: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      transactionId: PropTypes.string.isRequired
    }).isRequired
  };

  static defaultProps = {
    isCapturing: false
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

  handleClickCapture = async () => {
    const { onCapturePayment, payment } = this.props;

    return onCapturePayment(payment._id);
  }

  renderStatus(status) {
    return displayStatuses[status];
  }

  render() {
    const { components: { Button }, isCapturing, payment } = this.props;
    const { isApproving } = this.state;
    const { _id, amount, captureErrorMessage, displayName, processor, status, transactionId } = payment;

    return (
      <div key={_id} className="order-payment-list-item">
        <div><strong>{displayName}</strong></div>
        <div><strong data-i18n="order.processor">Processor: </strong> {processor}</div>
        <div><strong data-i18n="order.transaction">Transaction ID:</strong> {transactionId}</div>
        <div><strong data-i18n="order.amount">Amount:</strong> {formatPriceString(amount)}</div>
        <div><strong data-i18n="order.status">Status:</strong> {this.renderStatus(status)}</div>
        {!!captureErrorMessage && <div>{captureErrorMessage}</div>}
        <div className="order-payment-action-area">
          {["created", "adjustments"].indexOf(status) > -1 ?
            <Button
              actionType="important"
              isFullWidth
              isWaiting={isApproving}
              onClick={this.handleClickApprove}
            >
              {i18next.t("order.approveInvoice")}
            </Button>
            : null
          }
          {["approved", "error"].indexOf(payment.status) > -1 ?
            <Button
              actionType="important"
              isFullWidth
              isWaiting={isCapturing}
              onClick={this.handleClickCapture}
            >
              {i18next.t("order.capturePayment")}
            </Button>
            : null
          }
        </div>
      </div>
    );
  }
}

export default withComponents(OrderPayment);
