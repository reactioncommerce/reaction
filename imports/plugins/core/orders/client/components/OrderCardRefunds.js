import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import withStyles from "@material-ui/core/styles/withStyles";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardHeader from "@material-ui/core/CardHeader";
import Divider from "@material-ui/core/Divider";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { i18next, Reaction } from "/client/api";
import Button from "/imports/client/ui/components/Button";




import { Mutation } from "react-apollo";

import { Form } from "reacto-form";


import Link from "@material-ui/core/Link";
import ErrorsBlock from "@reactioncommerce/components/ErrorsBlock/v1";
import Field from "@reactioncommerce/components/Field/v1";
import TextInput from "@reactioncommerce/components/TextInput/v1";

import updateOrderFulfillmentGroupMutation from "../graphql/mutations/updateOrderFulfillmentGroup";


const styles = (theme) => ({
  fontWeightSemiBold: {
    fontWeight: theme.typography.fontWeightSemiBold
  }
});

class OrderCardRefunds extends Component {
  static propTypes = {
    classes: PropTypes.object,
    order: PropTypes.object
  };

  state = {
    calculateByItem: false,
    isEditing: true,
    refundTotal: 1.23
  };

  handleChange = (name) => (event) => {
    this.setState({ [name]: event.target.checked });
  };

  renderCalculateRefundByItem = () => {
    return "Calculate refund by item";
  }

  renderPayments = () => {
    const { classes, order } = this.props;
    const { refundTotal } = this.state;
    const { payments } = order;

    return payments.map((payment) => {
      const { displayName } = payment;
      return (
        <Grid container>
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
  }




  renderReason() {
    const hasPermission = Reaction.hasPermission("reaction-orders", Reaction.getUserId(), Reaction.getShopId());
    const { fulfillmentGroup } = this.props;
    const { isEditing, trackingNumber } = this.state;

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
                  onChange={this.handleFormChange}
                  onSubmit={(data) => this.handleUpdateFulfillmentGroupTrackingNumber(data, mutationFunc)}
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
  }



  render() {
    const { classes, order } = this.props;
    const { calculateByItem } = this.state;

    return (
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
                  onChange={this.handleChange("calculateByItem")}
                  value="calculateByItem"
                />
              }
              label={i18next.t("order.calculateRefundByItem", "Calculate refund by item")}
            />
          </FormGroup>
          {calculateByItem === true &&
            this.renderCalculateRefundByItem()
          }
          <Grid container spacing={24}>
            <Grid item xs={12}>
              {this.renderPayments()}
            </Grid>
            <Grid item xs={12}>
              {this.renderReason()}
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  }
}

export default withStyles(styles, { name: "RuiOrderCardRefunds" })(OrderCardRefunds);
