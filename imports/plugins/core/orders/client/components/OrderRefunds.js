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

  const handleFormChange = () => {
    console.log("do nothing yet");
  };


  // state = {
  //   isEditing: this.props.fulfillmentGroup.tracking === null,
  //   trackingNumber: this.props.fulfillmentGroup.tracking
  // }

  // handleFormChange = (value) => {
  //   this.formValue = value;
  // };

  // handleSubmitForm = () => {
  //   const hasPermission = Reaction.hasPermission(["reaction-orders", "order/fulfillment"], Reaction.getUserId(), Reaction.getShopId());

  //   if (hasPermission) {
  //     this.form.submit();
  //   }
  // };


  // If true, show UI to calculate refunds by item
  const handleRefundCalculateByItemSwitchChange = () => {
    setCalculateByItem(!calculateByItem);
  };






  const renderPayments = () => payments.map((payment) => {
      const { displayName } = payment;
      return (
        <Grid container key={payment._id}>
          <Grid item xs={6}>
            <Typography variant="body1">Refund to <span className={classes.fontWeightSemiBold}>{displayName}</span></Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body1">refund field</Typography>
          </Grid>
          <Grid item xs={12}>
            <Button color="primary" variant="contained">Refund ${refundTotal}</Button>
          </Grid>
        </Grid>
      );
    });


  const renderReason = () => {
    const hasPermission = Reaction.hasPermission(["reaction-orders", "order/fulfillment"], Reaction.getUserId(), Reaction.getShopId());
    const { fulfillmentGroup } = props;


    if (hasPermission) {
      if (isEditing) {
        return (
          <Mutation mutation={updateOrderFulfillmentGroupMutation}>
            {(mutationFunc) => (
              <Fragment>
                <Form
                  ref={(formRef) => {
                    this.form = formRef;
                  }}
                  onChange={() => handleFormChange}
                  onSubmit={(data) => handleUpdateFulfillmentGroupTrackingNumber(data, mutationFunc)}
                  value={fulfillmentGroup}
                >
                  <Field
                    name="tracking"

                    labelFor="trackingInput"
                  >
                    <TextInput
                      id="trackingInput"
                      name="tracking"
                      placeholder={i18next.t("shopSettings.storefrontUrls.tracking", "Tracking")}
                      value={trackingNumber || ""}
                    />
                    <ErrorsBlock names={["tracking"]} />
                  </Field>

                  {trackingNumber ?
                    <Grid container alignItems="center" justify="flex-end" spacing={1}>
                      <Grid item>
                        <Button color="primary" size="small" variant="outlined" onClick={this.handleToggleEdit}>
                          {i18next.t("app.cancel", "Cancel")}
                        </Button>
                      </Grid>
                      <Grid item>
                        <Button color="primary" size="small" variant="contained" onClick={this.handleSubmitForm}>
                          {i18next.t("app.save", "Save")}
                        </Button>
                      </Grid>
                    </Grid>
                    :
                    <Button color="primary" size="small" variant="outlined" onClick={this.handleSubmitForm}>
                      {i18next.t("app.add", "Add")}
                    </Button>
                  }
                </Form>
              </Fragment>
            )}
          </Mutation>
        );
      }
    }
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
            <Divider className={classes.dividerSpacing} />
            {calculateByItem === true &&
              <Grid container>
                <Grid item xs={12}>
                  <Typography variant="body1">This is the section to render everything by item</Typography>
                  <Divider className={classes.dividerSpacing} />
                </Grid>
              </Grid>
            }
            <Grid container spacing={3}>
              <Grid item xs={12}>
                {renderPayments()}
              </Grid>
              <Grid item xs={12}>
                {renderReason()}
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
