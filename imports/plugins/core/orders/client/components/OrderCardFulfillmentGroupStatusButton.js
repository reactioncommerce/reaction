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
import Typography from "@material-ui/core/Typography";
import { i18next, Reaction } from "/client/api";
import ConfirmButton from "/imports/client/ui/components/ConfirmButton";
import updateOrderFulfillmentGroupMutation from "../graphql/mutations/updateOrderFulfillmentGroup";

const styles = (theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap"
  },
  formControl: {
    margin: theme.spacing.unit,
    minWidth: 120
  },
  selectEmpty: {
    marginTop: theme.spacing.unit * 2
  }
});

class OrderCardFulfillmentGroupStatusButton extends Component {
  static propTypes = {
    classes: PropTypes.object,
    order: PropTypes.shape({
      _id: PropTypes.string,
      fulfillmentGroups: PropTypes.arrayOf(PropTypes.shape({
        _id: PropTypes.string,
        items: PropTypes.array,
        selectedFulfillmentOption: PropTypes.shape({
          fulfillmentMethod: PropTypes.shape({
            carrier: PropTypes.string
          })
        }),
        status: PropTypes.string
      })),
      referenceId: PropTypes.string
    })
  };

  state = {
    labelWidth: 100,
    status: ""
  };

  // TODO: EK - this function
  handleSelectChange = (event, value, field) => {
    console.log(" ------ handle select change", event, value, field);
    this.setState({ [event.target.name]: event.target.value });

    // if (this.props.onProductFieldSave) {
    //   this.props.onProductFieldSave(this.product._id, field, value);
    // }
  }

  // TODO: EK - this function
  async handleUpdateFulfillmentGroupStatus(mutation, fulfillmentGroup) {
    const hasPermission = Reaction.hasPermission("reaction-orders", Reaction.getUserId(), Reaction.getShopId());

    if (hasPermission) {
      const { order } = this.props;
      let status;

      if (fulfillmentGroup.status === "new") {
        status = "coreOrderWorkflow/packed";
      }

      if (fulfillmentGroup.status === "coreOrderWorkflow/packed") {
        status = "coreOrderWorkflow/shipped";
      }

      await mutation({
        variables: {
          orderFulfillmentGroupId: fulfillmentGroup._id,
          orderId: order._id,
          status
        }
      });
    }
  }

  // TODO: When MUI 4.x is implemented, change this to `SplitButton`
  // https://material-ui.com/components/buttons/#split-button
  render() {
    const hasPermission = Reaction.hasPermission("reaction-orders", Reaction.getUserId(), Reaction.getShopId());
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
        label: "Canceled",
        value: "coreOrderWorkflow/canceled"
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

    let activeOption = null;
    if (fulfillmentGroup.status === "new") {
      activeOption = "coreOrderWorkflow/picked";
    }
    if (fulfillmentGroup.status === "coreOrderWorkflow/picked") {
      activeOption = "coreOrderWorkflow/packed";
    }
    if (fulfillmentGroup.status === "coreOrderWorkflow/packed") {
      activeOption = "coreOrderWorkflow/labeled";
    }
    if (fulfillmentGroup.status === "coreOrderWorkflow/labeled") {
      activeOption = "coreOrderWorkflow/shipped";
    }

    if (hasPermission && canUpdateFulfillmentStatus) {
      return (
        <Grid item>
          <Mutation mutation={updateOrderFulfillmentGroupMutation}>
            {(mutationFunc) => (
              <ConfirmButton
                buttonColor="secondary"
                buttonText={i18next.t("orderActions.updateGroupStatusLabel", "Update group status")}
                buttonVariant="contained"
                cancelActionText={i18next.t("app.close")}
                confirmActionText={i18next.t("orderActions.updateGroupStatusLabel", "Update group status")}
                title={i18next.t("orderActions.updateGroupStatusLabel", "Update group status")}
                message={i18next.t("order.updateGroupStatusDescription", "Update status for group and all items in it")}
                onConfirm={() => this.handleUpdateFulfillmentGroupStatus(mutationFunc, fulfillmentGroup)}
              >
                <FormControl variant="outlined" className={classes.formControl}>
                  <InputLabel
                    ref={(ref) => {
                      this.InputLabelRef = ref;
                    }}
                    htmlFor="outlined-age-simple"
                  >
                    Age
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
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    <MenuItem value={10}>Ten</MenuItem>
                    <MenuItem value={20}>Twenty</MenuItem>
                    <MenuItem value={30}>Thirty</MenuItem>
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
