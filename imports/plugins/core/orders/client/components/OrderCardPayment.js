/* eslint react/no-multi-comp: 0 */
import React from "react";
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

/**
 * @name OrderCardPayment
 * @param {Object} props Component props
 * @returns {React.Component} returns a React component
 */
function OrderCardPayment(props) {
  const handleCapturePayment = async (mutation) => {
    const hasPermission = Reaction.hasPermission("reaction-orders", Reaction.getUserId(), Reaction.getShopId());
    const { capturePayments, payment } = props;

    if (hasPermission) {
      return capturePayments(mutation, [payment._id]);
    }

    return null;
  };

  const renderCaptureErrorMessage = () => {
    const { classes, payment } = props;
    const { captureErrorMessage } = payment;
    if (captureErrorMessage) {
      return (
        <Typography className={classes.fontColorDanger} variant="body2" paragraph>
          Capture error: {captureErrorMessage}
        </Typography>
      );
    }

    return null;
  };

  const renderOrderRiskStatus = (riskLevel) => {
    const { classes, payment } = props;
    if (riskLevel !== "normal" && payment.mode !== "captured") {
      return (
        <Typography className={classes.fontColorDanger} variant="body2">
          Payment risk level: {capitalizeString(riskLevel)}
        </Typography>
      );
    }

    return null;
  };

  const renderStatus = (status) => displayStatuses[status];

  const renderCapturePaymentButton = () => {
    const hasPermission = Reaction.hasPermission("reaction-orders", Reaction.getUserId(), Reaction.getShopId());
    const { order, payment } = props;
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
                  onConfirm={() => handleCapturePayment(mutationFunc)}
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
              onClick={() => handleCapturePayment(mutationFunc)}
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
  };

  const { payment } = props;
  const { amount, displayName, processor, riskLevel, status, transactionId } = payment;

  return (
    <Grid container spacing={16}>
      <Grid item xs={6} md={6}>
        <Typography variant="body1">
          {displayName}
        </Typography>
        {renderOrderRiskStatus(riskLevel)}
        <Typography variant="body2">
          Processor: {processor}
        </Typography>
        <Typography variant="body2">
          Transaction ID: {transactionId}
        </Typography>
        <Typography variant="body2" paragraph>
          Status: {renderStatus(status)}
        </Typography>
        {renderCaptureErrorMessage()}
      </Grid>
      <Grid item xs={6} md={6}>
        <Typography variant="body1" align="right">
          {amount.displayAmount}
        </Typography>
      </Grid>
      {renderCapturePaymentButton()}
    </Grid>
  );
}

OrderCardPayment.propTypes = {
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

export default withStyles(styles, { name: "RuiOrderCardPayment" })(OrderCardPayment);
