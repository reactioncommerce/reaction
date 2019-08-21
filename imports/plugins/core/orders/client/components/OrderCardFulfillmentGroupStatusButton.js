import React, { Component } from "react";
import PropTypes from "prop-types";
import { Mutation } from "react-apollo";
import withStyles from "@material-ui/core/styles/withStyles";
import FormControl from "@material-ui/core/FormControl";
import Grid from "@material-ui/core/Grid";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import OutlinedInput from "@material-ui/core/OutlinedInput";
import Select from "@material-ui/core/Select";
import { i18next, Reaction } from "/client/api";
import ConfirmButton from "/imports/client/ui/components/ConfirmButton";
import updateOrderFulfillmentGroupMutation from "../graphql/mutations/updateOrderFulfillmentGroup";

const styles = (theme) => ({
  formControl: {
    margin: theme.spacing(),
    minWidth: 120
  }
});

class OrderCardFulfillmentGroupStatusButton extends Component {
  static propTypes = {
    classes: PropTypes.object,
    fulfillmentGroup: PropTypes.shape({
      _id: PropTypes.string,
      items: PropTypes.object,
      selectedFulfillmentOption: PropTypes.shape({
        fulfillmentMethod: PropTypes.shape({
          carrier: PropTypes.string
        })
      }),
      status: PropTypes.string
    })
  };

  state = {
    labelWidth: 100,
    status: this.props.fulfillmentGroup.status
  };

  handleSelectChange = (event) => {
    this.setState({
      [event.target.name]: event.target.value
    });
  }

  async handleUpdateFulfillmentGroupStatus(mutation) {
    const hasPermission = Reaction.hasPermission(["reaction-orders", "order/fulfillment"], Reaction.getUserId(), Reaction.getShopId());
    const { fulfillmentGroup, order } = this.props;

    if (hasPermission) {
      await mutation({
        variables: {
          orderFulfillmentGroupId: fulfillmentGroup._id,
          orderId: order._id,
          status: this.state.status
        }
      });
    }
  }

  // TODO: When MUI 4.x is implemented, change this to `SplitButton`
  // instead of using a select dropdown in a popup
  // https://material-ui.com/components/buttons/#split-button
  // TODO: Decide on a logic for when certain statuses might be disabled
  render() {
    const hasPermission = Reaction.hasPermission(["reaction-orders", "order/fulfillment"], Reaction.getUserId(), Reaction.getShopId());
    const { classes, fulfillmentGroup } = this.props;
    const canUpdateFulfillmentStatus = (fulfillmentGroup.status !== "coreOrderWorkflow/canceled");
    const options = [
      {
        label: "New",
        value: "new"
      }, {
        label: "Created",
        value: "coreOrderWorkflow/created"
      }, {
        label: "Processing",
        value: "coreOrderWorkflow/processing"
      }, {
        label: "Completed",
        value: "coreOrderWorkflow/completed"
      }, {
        label: "Picked",
        value: "coreOrderWorkflow/picked"
      }, {
        label: "Packed",
        value: "coreOrderWorkflow/packed"
      }, {
        label: "Labeled",
        value: "coreOrderWorkflow/labeled"
      }, {
        label: "Shipped",
        value: "coreOrderWorkflow/shipped"
      }
    ];

    if (hasPermission && canUpdateFulfillmentStatus) {
      return (
        <Grid item>
          <Mutation mutation={updateOrderFulfillmentGroupMutation}>
            {(mutationFunc) => (
              <ConfirmButton
                buttonColor="primary"
                buttonText={i18next.t("orderActions.updateGroupStatusLabel", "Update group status")}
                buttonVariant="contained"
                cancelActionText={i18next.t("app.close")}
                confirmActionText={i18next.t("orderActions.updateGroupStatusLabel", "Update group status")}
                title={i18next.t("orderActions.updateGroupStatusLabel", "Update group status")}
                message={i18next.t("order.updateGroupStatusDescription", "Update status for group and all items in it")}
                onConfirm={() => this.handleUpdateFulfillmentGroupStatus(mutationFunc)}
              >
                <FormControl variant="outlined" className={classes.formControl}>
                  <InputLabel
                    ref={(ref) => {
                      this.InputLabelRef = ref;
                    }}
                    htmlFor="outlined-age-simple"
                  >
                    {i18next.t("order.newStatus", "New status")}
                  </InputLabel>
                  <Select
                    value={this.state.status}
                    onChange={this.handleSelectChange}
                    input={
                      <OutlinedInput
                        labelWidth={this.state.labelWidth}
                        name="status"
                        id="outlined-status-simple"
                      />
                    }
                  >
                    {options.map((option, index) => <MenuItem key={index} value={option.value}>{option.label}</MenuItem>)}
                  </Select>
                </FormControl>
              </ConfirmButton>
            )}
          </Mutation>
        </Grid>
      );
    }

    return null;
  }
}

export default withStyles(styles, { name: "RuiOrderCardFulfillmentGroupStatusButton" })(OrderCardFulfillmentGroupStatusButton);
