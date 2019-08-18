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
  dangerText: {
    color: theme.palette.colors.red
  },
  extraEmphasisText: {
    fontWeight: theme.typography.fontWeightSemiBold
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
 * @name OrderPayment
 * @param {Object} props Component props
 * @returns {React.Component} returns a React component
 */
function OrderPayment(props) {
  const hasPermission = Reaction.hasPermission(["reaction-orders", "order/fulfillment"], Reaction.getUserId(), Reaction.getShopId());
  const { classes, order, payment } = props;
  const { amount, captureErrorMessage, displayName, processor, riskLevel, status, transactionId } = payment;
  const canCapturePayment = payment.mode !== "captured";

  const handleCapturePayment = (mutation) => {
    const { capturePayments } = props;

    if (hasPermission) {
      capturePayments(mutation, [payment._id]);
    }
  };

  let capturePaymentButton;
  if (hasPermission && canCapturePayment) {
    // If any payment we are trying to capture has an elevated risk,
    // prompt user to make sure they want to capture payment
    if (isPaymentRiskElevated(order, [payment._id])) {
      capturePaymentButton =
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
      ;
    } else {
      capturePaymentButton =
        <Grid item xs={12}>
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
        </Grid>
      ;
    }
  }

  return (
    <Grid container spacing={2}>
      <Grid item xs={6} md={6}>
        <Typography paragraph variant="h4">
          {displayName}
        </Typography>
        {riskLevel && riskLevel !== "normal" && payment.mode !== "captured" &&
          <Typography className={classes.dangerText} variant="body2">
            Payment risk level: {capitalizeString(riskLevel)}
          </Typography>
        }
        <Typography variant="body2">
          Processor: {processor}
        </Typography>
        <Typography variant="body2">
          Transaction ID: {transactionId}
        </Typography>
        <Typography variant="body2" paragraph>
          Status: {displayStatuses[status]}
        </Typography>
        { captureErrorMessage &&
          <Typography className={classes.dangerText} variant="body2" paragraph>
            Capture error: {captureErrorMessage}
          </Typography>
        }
      </Grid>
      <Grid item xs={6} md={6}>
        <Typography className={classes.extraEmphasisText} variant="body1" align="right">
          {amount.displayAmount}
        </Typography>
      </Grid>
      {capturePaymentButton}
    </Grid>
  );
}

OrderPayment.propTypes = {
  capturePayments: PropTypes.func,
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

export default withStyles(styles, { name: "RuiOrderPayment" })(OrderPayment);
