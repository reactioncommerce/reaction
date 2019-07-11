import React, { Fragment, useState } from "react";
import PropTypes from "prop-types";
import { Mutation } from "react-apollo";
import { Form } from "reacto-form";
import withStyles from "@material-ui/core/styles/withStyles";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardHeader from "@material-ui/core/CardHeader";
import Divider from "@material-ui/core/Divider";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Grid from "@material-ui/core/Grid";
import Switch from "@material-ui/core/Switch";
import Typography from "@material-ui/core/Typography";
import ErrorsBlock from "@reactioncommerce/components/ErrorsBlock/v1";
import Field from "@reactioncommerce/components/Field/v1";
import TextInput from "@reactioncommerce/components/TextInput/v1";
import { i18next, Reaction } from "/client/api";
import Button from "/imports/client/ui/components/Button";
import updateOrderFulfillmentGroupMutation from "../graphql/mutations/updateOrderFulfillmentGroup";

const styles = (theme) => ({
  dividerSpacing: {
    marginBottom: theme.spacing.unit * 4,
    marginTop: theme.spacing.unit * 4
  },
  fontWeightSemiBold: {
    fontWeight: theme.typography.fontWeightSemiBold
  }
});

/**
 * @name OrderRefunds
 * @param {Object} props Component props
 * @returns {React.Component} returns a React component
 */
function OrderRefunds(props) {
  const { classes, order } = props;
  const { payments } = order;
  const [calculateByItem, setCalculateByItem] = useState(false);
  const [isEditing, setIsEditing] = useState(true);
  const [refundTotal, setRefundTotal] = useState(true);
  const trackingNumber = "12345";
  const previousRefunds = true;

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
                    <Grid container alignItems="center" justify="flex-end" spacing={8}>
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
    <Grid container spacing={24}>
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
            <Grid container spacing={24}>
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
      {previousRefunds &&
        <Grid item xs={12}>
          <Card elevation={0}>
            <CardHeader
              title={i18next.t("order.previousRefunds", "Previous Refunds")}
            />
            <CardContent>
              <Typography variant="body1">Date</Typography>
              <Typography variant="body1">Refunded to... source</Typography>
              <Divider className={classes.dividerSpacing} />
              <Typography variant="body1">Reason</Typography>
              <Typography variant="body1">customer changed mind</Typography>
            </CardContent>
          </Card>
        </Grid>
      }
    </Grid>
  );
}

OrderRefunds.propTypes = {
  classes: PropTypes.object,
  order: PropTypes.object
};

export default withStyles(styles, { name: "RuiOrderRefunds" })(OrderRefunds);
