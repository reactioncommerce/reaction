import React, { Fragment, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Mutation } from "react-apollo";
import { Form } from "reacto-form";
import withStyles from "@material-ui/core/styles/withStyles";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardHeader from "@material-ui/core/CardHeader";
import Divider from "@material-ui/core/Divider";
import FormControl from "@material-ui/core/FormControl";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import InputLabel from "@material-ui/core/InputLabel";
import Grid from "@material-ui/core/Grid";
import MenuItem from "@material-ui/core/MenuItem";
import OutlinedInput from "@material-ui/core/OutlinedInput";
import Select from "@material-ui/core/Select";
import Switch from "@material-ui/core/Switch";
import Typography from "@material-ui/core/Typography";
import ErrorsBlock from "@reactioncommerce/components/ErrorsBlock/v1";
import Field from "@reactioncommerce/components/Field/v1";
import TextInput from "@reactioncommerce/components/TextInput/v1";
import { i18next, Reaction } from "/client/api";
import formatMoney from "/imports/utils/formatMoney";
import ConfirmButton from "/imports/client/ui/components/ConfirmButton";
import createRefundMutation from "../graphql/mutations/createRefund";
import OrderPreviousRefunds from "./OrderPreviousRefunds";

const styles = (theme) => ({
  dividerSpacing: {
    marginBottom: theme.spacing(4),
    marginTop: theme.spacing(4)
  },
  fontWeightSemiBold: {
    fontWeight: theme.typography.fontWeightSemiBold
  },
  formControl: {
    minWidth: "250px",
    width: "250px"
  },
  selectEmpty: {
    marginTop: theme.spacing(2)
  }
});

/**
 * @name OrderRefunds
 * @param {Object} props Component props
 * @returns {React.Component} returns a React component
 */
function OrderRefunds(props) {
  const hasPermission = Reaction.hasPermission(["reaction-orders", "order/fulfillment"], Reaction.getUserId(), Reaction.getShopId());
  const { classes, order } = props;
  const { payments } = order;

  // useRef
  const inputLabel = useRef(null);

  // useState
  const [allowShippingRefund, setAllowShippingRefund] = useState(false);
  const [calculateByItem, setCalculateByItem] = useState(false);
  const [labelWidth, setLabelWidth] = useState(0);
  const [refundReasonSelectValues, setRefundReasonSelectValues] = useState({ reason: "" });
  const [refundTotal, setRefundTotal] = useState(0.00);

  // useEffect
  // update label width when refund select is activate
  useEffect(() => {
    if (inputLabel && inputLabel.current) {
      setLabelWidth(inputLabel.current.offsetWidth);
    }
  }, []);

  const canRefund = payments.every((payment) => payment.status !== "refunded");
  // calculated refund total from inputs
  const calculatedRefundTotalDisplay = formatMoney(refundTotal, order.currencyCode);
  // previous refunds
  const orderPreviousRefundTotal = order.refunds.reduce((acc, refund) => acc + refund.amount.amount, 0);
  // available to refund
  const orderAmountAvailableForRefund = order.summary.total.amount - orderPreviousRefundTotal;
  const orderAmountAvailableForRefundDisplay = formatMoney(orderAmountAvailableForRefund, order.currencyCode);

  const handleCreateRefund = (data, mutation) => {
    const { amounts } = data;
    const { reason } = refundReasonSelectValues;

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
      // so we include it in the mutation only if there if a value
      if (reason) {
        variables.reason = reason;
      }

      if (hasPermission) {
        mutation({
          variables
        });
      }
    });
  };

  // When refund amounts are changed, add up amounts to display in button
  const handleRefundTotalUpdate = () => {
    if (this.form && this.form.state) {
      const { amounts } = this.form.state.value;

      const reducedRefundTotal = Object.keys(amounts).map((paymentId) => ({
        paymentId,
        amount: parseFloat(amounts[paymentId], 10)
      })).filter((payment) => payment.amount && payment.amount > 0).reduce((acc, value) => acc + value.amount, 0);

      setRefundTotal(() => reducedRefundTotal);
    }
  };

  const handleRefundAmountChange = (amount) => {
    if (amount) handleRefundTotalUpdate();
  };

  const handleRefundReasonSelectChange = (event) => {
    handleRefundTotalUpdate();
    setRefundReasonSelectValues((oldValues) => ({
      ...oldValues,
      [event.target.name]: event.target.value
    }));
  };

  const handleSubmitForm = () => {
    if (hasPermission) {
      this.form.submit();
    }
  };

  // If true, show UI to calculate refunds by item
  const handleRefundCalculateByItemSwitchChange = () => {
    setCalculateByItem(!calculateByItem);
  };

  // If true, add shipping amount into refundable price
  const handleRefundAllowShippingRefundSwitchChange = () => {
    setAllowShippingRefund(!allowShippingRefund);
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card elevation={0}>
          <CardHeader
            title={i18next.t("order.amountToRefund", "Amount to refund")}
          />
          {canRefund ?
            <CardContent>
              <FormGroup row>
                <FormControlLabel
                  control={
                    <Switch
                      checked={calculateByItem}
                      onChange={() => handleRefundCalculateByItemSwitchChange("calculateByItem")}
                      value="calculateByItem"
                    />
                  }
                  label={i18next.t("order.calculateRefundByItem", "Calculate refund by item")}
                />
              </FormGroup>
              <FormGroup row>
                <FormControlLabel
                  control={
                    <Switch
                      checked={allowShippingRefund}
                      onChange={() => handleRefundAllowShippingRefundSwitchChange("allowShippingRefund")}
                      value="allowShippingRefund"
                    />
                  }
                  label={i18next.t("order.allowShippingRefund", "Allow shipping to be refunded")}
                />
              </FormGroup>
              <Divider className={classes.dividerSpacing} />
              {calculateByItem === true &&
              <Grid container>
                <Grid item xs={12}>
                  <Typography variant="body1">This is the section to render everything by item</Typography>
                  <Divider className={classes.dividerSpacing} />
                </Grid>
              </Grid>
              }
              {allowShippingRefund === true &&
              <Grid container>
                <Grid item xs={12}>
                  <Typography variant="body1">We will allow shipping to be refunded as well. This is not typical.</Typography>
                  <Divider className={classes.dividerSpacing} />
                </Grid>
              </Grid>
              }
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Mutation mutation={createRefundMutation}>
                    {(mutationFunc) => (
                      <Form
                        ref={(formRef) => {
                          this.form = formRef;
                        }}
                        onSubmit={(data) => handleCreateRefund(data, mutationFunc)}
                      >
                        <Grid container spacing={3}>
                          {
                            payments.map((payment) => {
                              const canRefundPayment = payment.status !== "refunded";
                              // previous refunds
                              const paymentPreviousRefundTotal = payment.refunds.reduce((acc, refund) => acc + refund.amount.amount, 0);
                              const paymentPreviousRefundTotalDisplay = formatMoney(paymentPreviousRefundTotal, order.currencyCode);
                              // available to refund
                              const paymentAmountAvailableForRefund = payment.amount.amount - paymentPreviousRefundTotal;
                              const paymentAmountAvailableForRefundDisplay = formatMoney(paymentAmountAvailableForRefund, order.currencyCode);

                              return (
                                <Grid item xs={12}>
                                  <Grid container>
                                    <Grid item xs={6}>
                                      <Typography variant="body1">
                                        {i18next.t("order.refundTo", "Refund to")} <span className={classes.fontWeightSemiBold}>{payment.displayName}</span>
                                      </Typography>
                                      {canRefundPayment ?
                                        <Fragment>
                                          <Typography variant="body2">
                                            {i18next.t("order.availableToRefund", "Available to refund")}: {paymentAmountAvailableForRefundDisplay}
                                          </Typography>
                                          {paymentPreviousRefundTotal && paymentPreviousRefundTotal > 0 &&
                                          <Typography variant="body2">
                                            {i18next.t("order.previouslyRefunded", "Previously refunded")}: {paymentPreviousRefundTotalDisplay}
                                          </Typography>
                                          }
                                        </Fragment>
                                        :
                                        <Typography variant="caption">{i18next.t("order.paymentRefunded", "Payment is fully refunded")}</Typography>
                                      }
                                    </Grid>
                                    <Grid item xs={3} md={4} />
                                    {canRefundPayment &&
                                    <Grid item xs={3} md={2}>
                                      <Field
                                        name={`amounts.${payment._id}`}
                                        labelFor={`amounts${payment._id}Input`}
                                      >
                                        {/* TODO: make sure `min` and `max` function here when `TextInput` is updated */}
                                        <TextInput
                                          id={`amounts${payment._id}Input`}
                                          min={0}
                                          max={paymentAmountAvailableForRefund}
                                          name={`amounts.${payment._id}`}
                                          onChange={handleRefundAmountChange}
                                          onChanging={handleRefundAmountChange}
                                          placeholder={i18next.t("order.amountToRefund", "Amount to refund")}
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
                                <InputLabel ref={inputLabel} htmlFor="outlined-age-simple">
                                Reason
                                </InputLabel>
                                <Select
                                  input={<OutlinedInput labelWidth={labelWidth} name="reason" id="reasonInput" />}
                                  name="reason"
                                  onChange={handleRefundReasonSelectChange}
                                  value={refundReasonSelectValues.reason}
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
                                  currentRefundAmount: refundTotal > orderAmountAvailableForRefund ? orderAmountAvailableForRefundDisplay : calculatedRefundTotalDisplay
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
                                `Apply refund of ${refundTotal > orderAmountAvailableForRefund ? orderAmountAvailableForRefundDisplay : calculatedRefundTotalDisplay} to this order?`
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
            :
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="body1">{i18next.t("order.allPaymentsRefunded", "All payments have been fully refunded")}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          }
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

export default withStyles(styles, { name: "RuiOrderRefunds" })(OrderRefunds);
