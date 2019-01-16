import React, { Component } from "react";
import PropTypes from "prop-types";
import { withComponents } from "@reactioncommerce/components-context";
import { CustomPropTypes } from "@reactioncommerce/components/utils";
import { Components } from "@reactioncommerce/reaction-components";
import { formatPriceString, i18next } from "/client/api";

const displayStatuses = {
  approved: "Approved",
  canceled: "Canceled authorization before capture",
  completed: "Captured",
  created: "Awaiting approval",
  error: "Error",
  partialRefund: "Partially refunded",
  refunded: "Fully refunded"
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
     * Currency details for the current shop
     */
    currency: PropTypes.object,
    /**
     * True if currently capturing this payment
     */
    isCapturing: PropTypes.bool,
    /**
     * True while a refund is being created
     */
    isRefunding: PropTypes.bool,
    /**
     * Function to be called when "Approve" is clicked for a payment
     */
    onApprovePayment: PropTypes.func.isRequired,
    /**
     * Function to be called when "Capture" is clicked for a payment
     */
    onCapturePayment: PropTypes.func.isRequired,
    /**
     * Function to be called when a refund is requested for a payment
     */
    onRefundPayment: PropTypes.func.isRequired,
    /**
     * Payment details
     */
    payment: PropTypes.shape({
      _id: PropTypes.string.isRequired,
      amount: PropTypes.number.isRequired,
      captureErrorMessage: PropTypes.string,
      displayName: PropTypes.string.isRequired,
      processor: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      transactionId: PropTypes.string.isRequired
    }).isRequired,
    /**
     * The payment method definition
     */
    paymentMethod: PropTypes.shape({
      canRefund: PropTypes.bool.isRequired
    }),
    /**
     * List of refunds
     */
    refunds: PropTypes.arrayOf(PropTypes.shape({
      amount: PropTypes.number.isRequired,
      paymentId: PropTypes.string.isRequired
    }))
  };

  static defaultProps = {
    isCapturing: false
  };

  state = {
    isApproving: false,
    value: 0
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

  handleClickRefund = async () => {
    const { onRefundPayment, payment } = this.props;

    await onRefundPayment(payment._id, this.state.value);

    if (this._isMounted) this.setState({ value: 0 });
  }

  renderRefundForm() {
    const {
      components: { Button },
      currency,
      isRefunding
    } = this.props;

    return (
      <div className="flex refund-container">
        <div className="refund-input">
          <Components.NumericInput
            numericType="currency"
            value={this.state.value}
            format={currency}
            classNames={{
              input: {
                amount: true
              }
            }}
            onChange={(event, value) => {
              this.setState({ value });
            }}
          />
        </div>

        <Button
          isDisabled={this.state.value === 0}
          isShortHeight
          isWaiting={isRefunding}
          onClick={this.handleClickRefund}
        >
          {i18next.t("order.applyRefund")}
        </Button>
      </div>
    );
  }

  renderStatus(status) {
    return displayStatuses[status];
  }

  render() {
    const { components: { Button }, isCapturing, payment, paymentMethod, refunds } = this.props;
    const { isApproving } = this.state;
    const { _id, amount, captureErrorMessage, displayName, processor, status, transactionId } = payment;
    const refundTotal = (refunds || []).reduce((acc, item) => acc + item.amount, 0);

    return (
      <div key={_id} className="order-payment-list-item">
        <div><strong>{displayName}</strong></div>
        <div><strong data-i18n="order.processor">Processor: </strong> {processor}</div>
        <div><strong data-i18n="order.transaction">Transaction ID:</strong> {transactionId}</div>
        <div><strong data-i18n="order.amount">Amount:</strong> {formatPriceString(amount)}</div>
        {!!refundTotal && <div><strong data-i18n="order.refundAmount">Refunded Amount:</strong> {formatPriceString(refundTotal)}</div>}
        <div><strong data-i18n="order.status">Status:</strong> {this.renderStatus(status)}</div>
        {!!captureErrorMessage && <div>{captureErrorMessage}</div>}
        <div className="order-payment-action-area">
          {["created", "adjustments"].indexOf(status) > -1 &&
            <Button
              actionType="important"
              isFullWidth
              isWaiting={isApproving}
              onClick={this.handleClickApprove}
            >
              {i18next.t("order.approveInvoice")}
            </Button>
          }
          {["approved", "error"].indexOf(payment.status) > -1 &&
            <Button
              actionType="important"
              isFullWidth
              isWaiting={isCapturing}
              onClick={this.handleClickCapture}
            >
              {i18next.t("order.capturePayment")}
            </Button>
          }
          {!!paymentMethod && paymentMethod.canRefund && ["completed", "partialRefund"].indexOf(status) > -1 && this.renderRefundForm()}
        </div>
      </div>
    );
  }
}

export default withComponents(OrderPayment);
