import React, { Component } from "react";
import PropTypes from "prop-types";
import { Mutation } from "react-apollo";
import withStyles from "@material-ui/core/styles/withStyles";
import Grid from "@material-ui/core/Grid";
import SplitButton from "@reactioncommerce/catalyst/SplitButton";
import { i18next, Reaction } from "/client/api";
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

  async handleUpdateFulfillmentGroupStatus(mutation, option) {
    const hasPermission = Reaction.hasPermission(["reaction-orders", "order/fulfillment"], Reaction.getUserId(), Reaction.getShopId());
    const { fulfillmentGroup, order } = this.props;

    if (hasPermission) {
      await mutation({
        variables: {
          orderFulfillmentGroupId: fulfillmentGroup._id,
          orderId: order._id,
          status: option.value
        }
      });
    }
  }

  // TODO: Decide on a logic for when certain statuses might be disabled
  render() {
    const hasPermission = Reaction.hasPermission(["reaction-orders", "order/fulfillment"], Reaction.getUserId(), Reaction.getShopId());
    const { fulfillmentGroup } = this.props;
    const canUpdateFulfillmentStatus = (fulfillmentGroup.status !== "coreOrderWorkflow/canceled");
    const options = [
      {
        label: i18next.t("status.new"),
        value: "new"
      }, {
        label: i18next.t("status.coreOrderWorkflow/created"),
        value: "coreOrderWorkflow/created"
      }, {
        label: i18next.t("status.coreOrderWorkflow/processing"),
        value: "coreOrderWorkflow/processing"
      }, {
        label: i18next.t("status.coreOrderWorkflow/completed"),
        value: "coreOrderWorkflow/completed"
      }, {
        label: i18next.t("status.coreOrderWorkflow/picked"),
        value: "coreOrderWorkflow/picked"
      }, {
        label: i18next.t("status.coreOrderWorkflow/packed"),
        value: "coreOrderWorkflow/packed"
      }, {
        label: i18next.t("status.coreOrderWorkflow/labeled"),
        value: "coreOrderWorkflow/labeled"
      }, {
        label: i18next.t("status.coreOrderWorkflow/shipped"),
        value: "coreOrderWorkflow/shipped"
      }
    ];

    if (hasPermission && canUpdateFulfillmentStatus) {
      return (
        <Grid item>
          <Mutation mutation={updateOrderFulfillmentGroupMutation}>
            {(mutationFunc) => (
              <SplitButton
                options={options}
                onClick={(option) => this.handleUpdateFulfillmentGroupStatus(mutationFunc, option)}
              />
            )}
          </Mutation>
        </Grid>
      );
    }

    return null;
  }
}

export default withStyles(styles, { name: "RuiOrderCardFulfillmentGroupStatusButton" })(OrderCardFulfillmentGroupStatusButton);
