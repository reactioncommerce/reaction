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
import Button from "/imports/client/ui/components/Button";
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
    margin: theme.spacing(1),
    minWidth: 120
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
    setLabelWidth(inputLabel.current.offsetWidth);
  }, []);

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
    const { amounts } = this.form.state.value;

    const reducedRefundTotal = Object.keys(amounts).map((paymentId) => ({
      paymentId,
      amount: parseFloat(amounts[paymentId], 10)
    })).filter((payment) => payment.amount && payment.amount > 0).reduce((acc, value) => acc + value.amount, 0);

    setRefundTotal(() => reducedRefundTotal);
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





  // Handle form change, not sure what to do with this
  const handleFormChange = () => {
    console.log("do nothing for now");
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
                      onChange={() => handleFormChange}
                      onSubmit={(data) => handleCreateRefund(data, mutationFunc)}
                    >
                      <Grid container spacing={3}>
                        {
                          payments.map((payment) => {
                            console.log(" ----- ----- ----- payment map, payment ID", payment._id, ": ", payment);
                            // TODO: EK - fix this up, check payment to see if refund is even available
                            return (
                              <Fragment>
                                <Grid item xs={6}>
                                  <Typography variant="body1">Refund to <span className={classes.fontWeightSemiBold}>{payment.displayName}</span></Typography>
                                </Grid>
                                <Grid item xs={6}>
                                  <Typography variant="body1">refund field</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                  <Field
                                    name={`amounts.${payment._id}`}
                                    labelFor={`amounts${payment._id}Input`}
                                  >
                                    <TextInput
                                      id={`amounts${payment._id}Input`}
                                      name={`amounts.${payment._id}`}
                                      onChange={() => handleRefundTotalUpdate}
                                      placeholder={i18next.t("order.amountToRefund", "Amount to refund")}
                                      type="number"
                                    />
                                    <ErrorsBlock names={["amounts"]} />
                                  </Field>
                                </Grid>
                              </Fragment>
                            );
                          })
                        }
                      </Grid>
                      <Field
                        name="reason"
                        label={i18next.t("order.reasonForRefundFormLabel", "Reason for refund (optional)")}
                        labelFor="reasonInput"
                      >
                        {/* TODO: EK - fix width of this form */}
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
                            <MenuItem value="requested_by_customer">Customer Request</MenuItem>
                            <MenuItem value="duplicate">Duplicate payment</MenuItem>
                            <MenuItem value="fraudulent">Fraudulent</MenuItem>
                          </Select>
                        </FormControl>
                        <ErrorsBlock names={["reason"]} />
                      </Field>
                      <Grid container alignItems="center" justify="flex-end" spacing={1}>
                        <Grid item>
                          <Button color="primary"variant="outlined" onClick={this.handleToggleEdit}>
                            {i18next.t("app.cancel", "Cancel")}
                          </Button>
                        </Grid>
                        <Grid item>
                          <Button color="primary" variant="contained" onClick={handleSubmitForm} disabled={refundTotal === 0.00}>
                            {i18next.t(
                              "order.refundButton",
                              {
                                currencySymbol: "$",
                                currentRefundAmount: refundTotal
                              },
                              `Refund ${refundTotal}`
                            )}
                          </Button>
                        </Grid>
                      </Grid>
                    </Form>
                  )}
                </Mutation>
              </Grid>
            </Grid>
          </CardContent>
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
