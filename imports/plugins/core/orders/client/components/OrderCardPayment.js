import React, { Component } from "react";
import PropTypes from "prop-types";
import { Mutation } from "react-apollo";
import withStyles from "@material-ui/core/styles/withStyles";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { i18next, Reaction } from "/client/api";
import capitalizeString from "/imports/utils/capitalizeString";
import { isPaymentRiskElevated } from "../helpers";
import ConfirmButton from "/imports/client/ui/components/ConfirmButton";
import Button from "/imports/client/ui/components/Button";
import captureOrderPaymentsMutation from "../graphql/mutations/captureOrderPayments";

const styles = (theme) => ({
  fontColorDanger: {
    color: theme.palette.colors.red
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
    classes: PropTypes.object,
    order: PropTypes.object,
    payment: PropTypes.shape({
      _id: PropTypes.string.isRequired,
      amount: PropTypes.shape({
        displayAmount: PropTypes.string
      }).isRequired,
      captureErrorMessage: PropTypes.string,
      displayName: PropTypes.string.isRequired,
      processor: PropTypes.string.isRequired,
      riskLevel: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      transactionId: PropTypes.string.isRequired
    }).isRequired
  };

  handleCapturePayment = async (mutation) => {
    const hasPermission = Reaction.hasPermission("reaction-orders", Reaction.getUserId(), Reaction.getShopId());
    const { capturePayments, payment } = this.props;

    if (hasPermission) {
      return capturePayments(mutation, [payment._id]);
    }
  }

  renderCaptureErrorMessage() {
    const { classes, payment } = this.props;
    const { captureErrorMessage } = payment;
    if (captureErrorMessage) {
      return (
        <Typography className={classes.fontColorDanger} variant="body2" paragraph>
          Capture error: {captureErrorMessage}
        </Typography>
      );
    }

    return null;
  }

  renderOrderRiskStatus(riskLevel) {
    const { classes, payment } = this.props;
    if (riskLevel !== "normal" && payment.mode !== "captured") {
      return (
        <Typography className={classes.fontColorDanger} variant="body2">
          Payment risk level: {capitalizeString(riskLevel)}
        </Typography>
      );
    }

    return null;
  }

  renderStatus(status) {
    return displayStatuses[status];
  }

  renderCapturePaymentButton = () => {
    const hasPermission = Reaction.hasPermission("reaction-orders", Reaction.getUserId(), Reaction.getShopId());
    const { order, payment } = this.props;
    const canCapturePayment = payment.mode !== "captured";
    if (hasPermission && canCapturePayment) {
      // If any payment we are trying to capture has an elevated risk,
      // prompt user to make sure they want to capture payemnt
      if (isPaymentRiskElevated(order, [payment._id])) {
        return (
          <Grid item xs={12}>
            <Mutation mutation={captureOrderPaymentsMutation}>
              {(mutationFunc, { loading }) => (
                <ConfirmButton
                  buttonColor="primary"
                  buttonText={i18next.t("order.capturePayment", "Capture payment")}
                  buttonVariant="outlined"
                  cancelActionText={i18next.t("app.close", "Close")}
                  confirmActionText={i18next.t("order.capturePayment", "Capture payment")}
                  isWaiting={loading}
                  title={i18next.t("order.capturePayment", "Capture payment")}
                  message={
                    i18next.t(
                      "reaction-payments.captureOneElevatedRiskWarning",
                      "The payment you are attempting to capture has an elevated charge risk. Do you want to proceed?"
                    )
                  }
                  onConfirm={() => this.handleCapturePayment(mutationFunc)}
                  size="small"
                />
              )}
            </Mutation>
          </Grid>
        );
      }
      return (<Grid item xs={12}>
        <Mutation mutation={captureOrderPaymentsMutation}>
          {(mutationFunc, { loading }) => (
            <Button
              color="primary"
              isWaiting={loading}
              onClick={() => this.handleCapturePayment(mutationFunc)}
              size="small"
              variant="outlined"
            >
              {i18next.t("order.capturePayment", "Capture payment")}
            </Button>
          )}
        </Mutation>
      </Grid>);
    }
    return null;
  }

  render() {
    const { payment } = this.props;
    const { amount, displayName, processor, riskLevel, status, transactionId } = payment;

    return (
      <Grid container spacing={16}>
        <Grid item xs={6} md={6}>
          <Typography variant="body1">
            {displayName}
          </Typography>
          {this.renderOrderRiskStatus(riskLevel)}
          <Typography variant="body2">
            Processor: {processor}
          </Typography>
          <Typography variant="body2">
            Transaction ID: {transactionId}
          </Typography>
          <Typography variant="body2" paragraph>
            Status: {this.renderStatus(status)}
          </Typography>
          {this.renderCaptureErrorMessage()}
        </Grid>
        <Grid item xs={6} md={6}>
          <Typography variant="body1" align="right">
            {amount.displayAmount}
          </Typography>
        </Grid>
        {this.renderCapturePaymentButton()}
      </Grid>
    );
  }
}

export default withStyles(styles, { name: "RuiOrderCardPayment" })(OrderCardPayment);
