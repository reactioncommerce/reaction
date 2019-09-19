/* eslint-disable no-nested-ternary */
import React, { Fragment, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Mutation } from "react-apollo";
import { Form } from "reacto-form";
import { makeStyles } from "@material-ui/styles";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardHeader from "@material-ui/core/CardHeader";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Grid from "@material-ui/core/Grid";
import MenuItem from "@material-ui/core/MenuItem";
import OutlinedInput from "@material-ui/core/OutlinedInput";
import Select from "@material-ui/core/Select";
import Typography from "@material-ui/core/Typography";
import ErrorsBlock from "@reactioncommerce/components/ErrorsBlock/v1";
import Field from "@reactioncommerce/components/Field/v1";
import InlineAlert from "@reactioncommerce/components/InlineAlert/v1";
import TextInput from "@reactioncommerce/components/TextInput/v1";
import { i18next } from "/client/api";
import formatMoney from "/imports/utils/formatMoney";
import ConfirmButton from "/imports/client/ui/components/ConfirmButton";
import createRefundMutation from "../graphql/mutations/createRefund";
import OrderPreviousRefunds from "./OrderPreviousRefunds";

const useStyles = makeStyles((theme) => ({
  dividerSpacing: {
    marginBottom: theme.spacing(4),
    marginTop: theme.spacing(4)
  },
  extraEmphasisText: {
    fontWeight: theme.typography.fontWeightSemiBold
  },
  formControl: {
    minWidth: "250px",
    width: "250px"
  },
  selectEmpty: {
    marginTop: theme.spacing(2)
  }
}));

/**
 * @name OrderRefunds
 * @param {Object} props Component props
 * @returns {React.Component} returns a React component
 */
function OrderRefunds(props) {
  const { order } = props;
  const classes = useStyles();
  const { payments } = order;

  // useRef
  const inputLabel = useRef(null);

  // useState
  const [labelWidth, setLabelWidth] = useState(0);
  const [refundReason, setRefundReason] = useState("");
  const [refundTotal, setRefundTotal] = useState(0.00);

  // useEffect
  // update label width when refund select is active
  useEffect(() => {
    if (inputLabel && inputLabel.current) {
      setLabelWidth(inputLabel.current.offsetWidth);
    }
  }, []);

  const areAnyPaymentsRefundable = payments.some((payment) => payment.method.canRefund === true);
  const areAllPaymentsFullyRefunded = payments.every((payment) => payment.status === "refunded");
  // calculated refund total from inputs
  const calculatedRefundTotalDisplay = formatMoney(refundTotal, order.currencyCode);
  // previous refunds
  const orderPreviousRefundTotal = order.refunds.reduce((acc, refund) => acc + refund.amount.amount, 0);
  // available to refund
  const orderAmountAvailableForRefund = order.summary.total.amount - orderPreviousRefundTotal;
  const orderAmountAvailableForRefundDisplay = formatMoney(orderAmountAvailableForRefund, order.currencyCode);

  const handleCreateRefund = (data, mutation) => {
    const { amounts } = data;

    // turn form data into an array of payments that provide paymentID and amount
    // then filter out any amounts that are `null` or `0`
    const paymentsToRefund = Object.keys(amounts).map((paymentId) => ({
      paymentId,
      amount: parseFloat(amounts[paymentId], 10)
    })).filter((payment) => payment.amount && payment.amount > 0);

    paymentsToRefund.forEach((payment) => {
      const variables = {
        amount: payment.amount,
        orderId: order._id,
        paymentId: payment.paymentId
      };

      // Stripe will not accept an empty string or `null` value for the `reason` field,
      // so only include `reason` in the mutation only if its' value is set
      if (refundReason) {
        variables.reason = refundReason;
      }

      mutation({
        variables
      });
    });
  };

  // When refund amounts are changed, add up amounts to display in button
  const handleRefundTotalUpdate = (formData) => {
    const { amounts } = formData;

    if (amounts) {
      const reducedRefundTotal = Object.keys(amounts).map((paymentId) => ({
        paymentId,
        amount: parseFloat(amounts[paymentId], 10)
      })).filter((payment) => payment.amount && payment.amount > 0).reduce((acc, value) => acc + value.amount, 0);

      setRefundTotal(() => reducedRefundTotal);
    }
  };

  const handleRefundReasonSelectChange = (event) => {
    setRefundReason(event.target.value);
  };

  const handleSubmitForm = () => {
    this.form.submit();
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card elevation={0}>
          <CardHeader
            title={i18next.t("order.amountToRefund")}
          />
          {!areAnyPaymentsRefundable ?
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="body1">
                    {i18next.t("order.refundsNotSupported")}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
            :
            (areAllPaymentsFullyRefunded ?
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="body1">{i18next.t("order.allPaymentsRefunded")}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
              :
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Mutation mutation={createRefundMutation}>
                      {(mutationFunc, { error }) => (
                        <Form
                          ref={(formRef) => {
                            this.form = formRef;
                          }}
                          onChange={handleRefundTotalUpdate}
                          onChanging={handleRefundTotalUpdate}
                          onSubmit={(data) => handleCreateRefund(data, mutationFunc)}
                        >
                          <Grid container spacing={3}>
                            {error &&
                              <Grid item xs={12}>
                                <InlineAlert
                                  alertType="error"
                                  message={error.message}
                                />
                              </Grid>
                            }
                            {
                              payments.map((payment) => {
                                const isPaymentRefundable = payment.method.canRefund === true;
                                const isPaymentFullyRefunded = payment.status === "refunded";
                                // previous refunds
                                const paymentPreviousRefundTotal = payment.refunds.reduce((acc, refund) => acc + refund.amount.amount, 0);
                                const paymentPreviousRefundTotalDisplay = formatMoney(paymentPreviousRefundTotal, order.currencyCode);
                                // available to refund
                                const paymentAmountAvailableForRefund = payment.amount.amount - paymentPreviousRefundTotal;
                                const paymentAmountAvailableForRefundDisplay = formatMoney(paymentAmountAvailableForRefund, order.currencyCode);

                                return (
                                  <Grid item xs={12} key={payment._id}>
                                    <Grid container>
                                      <Grid item xs={6}>
                                        <Typography variant="body1">
                                          {i18next.t("order.refundTo")} <span className={classes.extraEmphasisText}>{payment.displayName}</span>
                                        </Typography>
                                        {!isPaymentRefundable ?
                                          <Typography variant="caption">{i18next.t("order.refundNotSupported")}</Typography>
                                          :
                                          (!isPaymentFullyRefunded ?
                                            <Fragment>
                                              <Typography variant="body2">
                                                {i18next.t("order.availableToRefund")}: {paymentAmountAvailableForRefundDisplay}
                                              </Typography>
                                              {paymentPreviousRefundTotal && paymentPreviousRefundTotal > 0 &&
                                                <Typography variant="body2">
                                                  {i18next.t("order.previouslyRefunded")}: {paymentPreviousRefundTotalDisplay}
                                                </Typography>
                                              }
                                            </Fragment>
                                            :
                                            <Typography variant="caption">{i18next.t("order.paymentRefunded")}</Typography>
                                          )
                                        }
                                      </Grid>
                                      <Grid item xs={3} md={4} />
                                      {isPaymentRefundable && !isPaymentFullyRefunded &&
                                        <Grid item xs={3} md={2}>
                                          <Field
                                            name={`amounts.${payment._id}`}
                                            labelFor={`amounts${payment._id}Input`}
                                          >
                                            <TextInput
                                              id={`amounts${payment._id}Input`}
                                              min={0}
                                              max={paymentAmountAvailableForRefund}
                                              name={`amounts.${payment._id}`}
                                              placeholder="0.00"
                                              step=".01"
                                              type="number"
                                            />
                                            <ErrorsBlock names={["amounts"]} />
                                          </Field>
                                        </Grid>
                                      }
                                    </Grid>
                                  </Grid>
                                );
                              })
                            }
                            <Grid item xs={12}>
                              <Field
                                name="reason"
                                label={i18next.t("order.reasonForRefundFormLabel", "Reason for refund (optional)")}
                                labelFor="reasonInput"
                                sizing="50%"
                              >
                                <FormControl variant="outlined" className={classes.formControl}>
                                  <InputLabel ref={inputLabel} htmlFor="reason">
                                    {i18next.t("order.reason", "Reason")}
                                  </InputLabel>
                                  <Select
                                    input={<OutlinedInput labelWidth={labelWidth} name="reason" id="reasonInput" />}
                                    name="reason"
                                    onChange={handleRefundReasonSelectChange}
                                    value={refundReason}
                                  >
                                    <MenuItem value="">
                                      <em>None</em>
                                    </MenuItem>
                                    <MenuItem value="requested_by_customer">{i18next.t("order.refundReason.customerRequest", "Customer request")}</MenuItem>
                                    <MenuItem value="duplicate">{i18next.t("order.refundReason.duplicatePayment", "Duplicate payment")}</MenuItem>
                                    <MenuItem value="fraudulent">{i18next.t("order.refundReason.fraudulent", "Fraudulent")}</MenuItem>
                                  </Select>
                                </FormControl>
                                <ErrorsBlock names={["reason"]} />
                              </Field>
                            </Grid>
                          </Grid>
                          <Grid container alignItems="center" justify="flex-end" spacing={1}>
                            <Grid item>
                              <ConfirmButton
                                buttonColor="primary"
                                buttonText={i18next.t(
                                  "order.refundButton",
                                  {
                                    currentRefundAmount: refundTotal > orderAmountAvailableForRefund ? orderAmountAvailableForRefundDisplay : calculatedRefundTotalDisplay // eslint-disable-line max-len
                                  },
                                  `Refund ${refundTotal > orderAmountAvailableForRefund ? orderAmountAvailableForRefundDisplay : calculatedRefundTotalDisplay}`
                                )}
                                buttonVariant="contained"
                                cancelActionText={i18next.t("app.cancel", "Cancel")}
                                confirmActionText={i18next.t("order.applyRefund", "Apply refund")}
                                disabled={refundTotal === 0.00}
                                title={i18next.t("order.refund", "Refund")}
                                message={i18next.t(
                                  "order.applyRefundToThisOrder",
                                  {
                                    refund: refundTotal > orderAmountAvailableForRefund ? orderAmountAvailableForRefundDisplay : calculatedRefundTotalDisplay
                                  },
                                  `Apply refund of ${refundTotal > orderAmountAvailableForRefund ? orderAmountAvailableForRefundDisplay : calculatedRefundTotalDisplay} to this order?` // eslint-disable-line max-len
                                )}
                                onConfirm={handleSubmitForm}
                              />
                            </Grid>
                          </Grid>
                        </Form>
                      )}
                    </Mutation>
                  </Grid>
                </Grid>
              </CardContent>
            )}
        </Card>
      </Grid>
      <OrderPreviousRefunds order={order} />
    </Grid>
  );
}

OrderRefunds.propTypes = {
  classes: PropTypes.object,
  order: PropTypes.object
};

export default OrderRefunds;
