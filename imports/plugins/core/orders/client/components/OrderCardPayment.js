import React, { Component } from "react";
import PropTypes from "prop-types";
import withStyles from "@material-ui/core/styles/withStyles";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { i18next } from "/client/api";
import capitalizeString from "/imports/utils/capitalizeString";


const styles = (theme) => ({
  fulfillmentGroupSpacing: {
    marginBottom: theme.spacing.unit * 2
  },
  fulfillmentGroupHeader: {
    marginBottom: theme.spacing.unit * 2
  },
  orderCardInfoTextBold: {
    fontWeight: theme.typography.fontWeightBold
  }
});

const displayStatuses = {
  approved: "Approved",
  canceled: "Canceled authorization before capture",
  completed: "Captured",
  created: "Awaiting approval",
  error: "Error",
  partialRefund: "Partially refunded",
  refunded: "Fully refunded"
};

class OrderCardPayment extends Component {
  static propTypes = {
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
    // onApprovePayment: PropTypes.func.isRequired,
    /**
     * Function to be called when "Capture" is clicked for a payment
     */
    // onCapturePayment: PropTypes.func.isRequired,
    /**
     * Function to be called when a refund is requested for a payment
     */
    // onRefundPayment: PropTypes.func.isRequired,
    /**
     * Payment details
     */
    payment: PropTypes.shape({
      _id: PropTypes.string.isRequired,
      amount: PropTypes.shape({
        displayAmount: PropTypes.string
      }).isRequired,
      captureErrorMessage: PropTypes.string,
      currencyCode: PropTypes.string.isRequired,
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

  handleCapturePayment = async () => {
    const { capturePayments, payment } = this.props;

    return capturePayments([payment._id]);
  }

  renderOrderRiskStatus(riskLevel) {
    if (riskLevel !== "normal") {
      return (
        <Typography variant="body2" paragraph>
          Payment risk level: {capitalizeString(riskLevel)}
        </Typography>
      );
    }

    return null;
  }

  renderStatus(status) {
    return displayStatuses[status];
  }

  render() {
    const { classes, isCapturing, payment, paymentMethod, refunds } = this.props;
    const { isApproving } = this.state;
    const canCapturePayment = payment.mode !== "captured";



    const { _id, amount, captureErrorMessage, displayName, processor, riskLevel, status, transactionId } = payment;
    const refundTotal = (refunds || []).reduce((acc, item) => acc + item.amount, 0);

    return (
      <Grid container spacing={16}>
        <Grid item className={classes.orderCardSection} xs={6} md={6}>
          <Typography variant="body1">
            {displayName}
          </Typography>
          <Typography variant="body2">
            Processor: {processor}
          </Typography>
          <Typography variant="body2">
            Transaction ID: {transactionId}
          </Typography>
          <Typography variant="body2" paragraph>
            Status: {this.renderStatus(status)}
          </Typography>
          {this.renderOrderRiskStatus(riskLevel)}
        </Grid>
        <Grid item xs={6} md={6}>
          <Typography variant="body1" align="right">
            {amount.displayAmount}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          {canCapturePayment &&
            <Button
              color="primary"
              size="small"
              variant="outlined"
              onClick={() => this.handleCapturePayment()}
            >
              {i18next.t("order.capturePayment", "Capture payment")}
            </Button>
          }
        </Grid>
        <Grid item xs={12}>
          {/* TODO: EK - add refund information here once completed */}
          {/* {!!refundTotal && <div><strong data-i18n="order.refundAmount">Refunded Amount:</strong> {formatPriceString(refundTotal)}</div>}
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
          </div> */}
        </Grid>
      </Grid>
    );
  }
}

export default withStyles(styles, { name: "RuiOrderCardPayment" })(OrderCardPayment);
