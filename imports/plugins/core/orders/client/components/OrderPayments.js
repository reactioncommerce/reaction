import React, { Fragment } from "react";
import PropTypes from "prop-types";
import { useMutation } from "@apollo/react-hooks";
import withStyles from "@material-ui/core/styles/withStyles";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Divider from "@material-ui/core/Divider";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { i18next, Reaction } from "/client/api";
import Button from "/imports/client/ui/components/Button";
import ConfirmButton from "/imports/client/ui/components/ConfirmButton";
import approveOrderPaymentsMutation from "../graphql/mutations/approveOrderPayments";
import captureOrderPaymentsMutation from "../graphql/mutations/captureOrderPayments";
import { isPaymentRiskElevated } from "../helpers";
import OrderPayment from "./OrderPayment";

const styles = (theme) => ({
  dividerSpacing: {
    marginBottom: theme.spacing(4),
    marginTop: theme.spacing(4)
  },
  fulfillmentGroupHeader: {
    marginBottom: theme.spacing(4)
  }
});

/**
 * @name OrderPayments
 * @param {Object} props Component props
 * @returns {React.Component} returns a React component
 */
function OrderPayments(props) {
  const hasPermission = Reaction.hasPermission(["reaction-orders", "order/fulfillment"], Reaction.getUserId(), Reaction.getShopId());
  const { classes, order } = props;
  const canCapturePayment = order.payments.some((payment) => payment.mode !== "captured");
  const [approveOrderPayments] = useMutation(approveOrderPaymentsMutation);
  const [captureOrderPayments, { loading: captureOrderPaymentsLoading }] = useMutation(captureOrderPaymentsMutation);


  const handleCapturePayments = async (mutation, paymentIds) => {
    if (hasPermission) {
      if (!order.payments) return Promise.resolve(null);

      // If paymentIds are not provided, capture all payments
      const paymentIdList = paymentIds || order.payments.map((payment) => payment._id);

      // We need to approve all payments first in order for them to be
      // allowed to be captured. This is a legacy workflow step, and we can
      // look into removing it in the future. For now, we just combined it into
      // the capture flow.
      const paymentIdsNeedingApproval = order.payments.filter((payment) => paymentIdList.includes(payment._id) && ["adjustments", "created"].includes(payment.status)).map((payment) => payment._id); // eslint-disable-line max-len
      if (Array.isArray(paymentIdsNeedingApproval) && paymentIdsNeedingApproval.length !== 0) {
        approveOrderPayments({
          variables: {
            orderId: order._id,
            paymentIds: paymentIdList,
            shopId: order.shop._id
          }
        });
      }

      return captureOrderPayments({
        variables: {
          orderId: order._id,
          paymentIds: paymentIdList,
          shopId: order.shop._id
        }
      });
    }

    return null;
  };

  let capturePaymentsButton;
  if (hasPermission && canCapturePayment) {
    const paymentIdList = order.payments.map((payment) => payment._id);
    // If any payment we are trying to capture has an elevated risk,
    // prompt user to make sure they want to capture payment
    if (isPaymentRiskElevated(order, paymentIdList)) {
      capturePaymentsButton =
        <Grid item xs={6} md={6}>
          <Grid container alignItems="center" justify="flex-end" spacing={1}>
            <ConfirmButton
              buttonColor="primary"
              buttonText={i18next.t("reaction-payments.captureAllPayments", "Capture all payments")}
              buttonVariant="contained"
              cancelActionText={i18next.t("app.close", "Close")}
              confirmActionText={i18next.t("reaction-payments.captureAllPayments", "Capture all payments")}
              isWaiting={captureOrderPaymentsLoading}
              title={i18next.t("reaction-payments.captureAllPayments", "Capture all payments")}
              message={
                i18next.t(
                  "reaction-payments.captureAllElevatedRiskWarning",
                  "One or more of the payments you are attempting to capture has an elevated charge risk. Do you want to proceed?"
                )
              }
              onConfirm={() => handleCapturePayments()}
            />
          </Grid>
        </Grid>
      ;
    } else {
      capturePaymentsButton =
        <Grid item xs={6} md={6}>
          <Grid container alignItems="center" justify="flex-end" spacing={1}>
            <Button
              color="primary"
              isWaiting={captureOrderPaymentsLoading}
              onClick={() => handleCapturePayments()}
              variant="contained"
            >
              {i18next.t("reaction-payments.captureAllPayments", "Capture all payments")}
            </Button>
          </Grid>
        </Grid>
      ;
    }
  }

  return (
    <Card>
      <CardContent>
        <Grid container alignItems="center" className={classes.fulfillmentGroupHeader}>
          <Grid item xs={6} md={6}>
            <Grid container alignItems="center" spacing={2}>
              <Grid item>
                <Typography variant="h4" display="inline">
                  Payments
                </Typography>
              </Grid>
            </Grid>
          </Grid>
          {capturePaymentsButton}
        </Grid>
        {
          order.payments.map((payment, index) => (
            <Fragment key={index} >
              <OrderPayment
                capturePayments={handleCapturePayments}
                order={order}
                payment={payment}
              />
              {index !== (order.payments.length - 1) &&
                <Divider className={classes.dividerSpacing} />
              }
            </Fragment>
          ))
        }
      </CardContent>
    </Card>
  );
}

OrderPayments.propTypes = {
  classes: PropTypes.object,
  order: PropTypes.shape({
    payments: PropTypes.arrayOf(PropTypes.shape({
      _id: PropTypes.string,
      amount: PropTypes.shape({
        displayAmount: PropTypes.string
      }),
      displayName: PropTypes.string,
      status: PropTypes.string
    }))
  })
};

export default withStyles(styles, { name: "RuiOrderPayments" })(OrderPayments);
