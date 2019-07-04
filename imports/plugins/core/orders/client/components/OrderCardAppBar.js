import React, { Component } from "react";
import PropTypes from "prop-types";
import { Mutation } from "react-apollo";
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import { i18next, Reaction } from "/client/api";
import ConfirmButton from "/imports/client/ui/components/ConfirmButton";
import PrimaryAppBar from "/imports/client/ui/components/PrimaryAppBar/PrimaryAppBar";
import cancelOrderItemMutation from "../graphql/mutations/cancelOrderItem";


// TODO: EK - figure out how inventory should work here
class OrderCardAppBar extends Component {
  static propTypes = {
    classes: PropTypes.object,
    order: PropTypes.shape({
      status: PropTypes.string
    })
  }

  state = {
    shouldRestock: true
  }

  handleCancelOrder = (mutation) => {
    const hasPermission = Reaction.hasPermission("reaction-orders", Reaction.getUserId(), Reaction.getShopId());

    if (hasPermission) {
      const { order } = this.props;
      const { shouldRestock } = this.state;
      const { fulfillmentGroups } = order;

      // We need to loop over every fulfillmentGroup
      // and then loop over every item inside group
      fulfillmentGroups.forEach(async (fulfillmentGroup) => {
        fulfillmentGroup.items.nodes.forEach(async (item) => {
          await mutation({
            variables: {
              cancelQuantity: item.quantity,
              itemId: item._id,
              orderId: order._id,
              reason: "Order cancelled inside Catalyst operator UI"
            }
          });

          if (shouldRestock) {
            this.handleInventoryRestock(item);
          }
        });
      });
    }

    return null;
  }

  handleInventoryRestockCheckbox = (name) => (event) => {
    const hasPermission = Reaction.hasPermission("reaction-orders", Reaction.getUserId(), Reaction.getShopId());

    if (hasPermission) {
      this.setState({
        ...this.state,
        [name]: event.target.checked
      });
    }
  };

  handleInventoryRestock = (item) => {
    const hasPermission = Reaction.hasPermission("reaction-orders", Reaction.getUserId(), Reaction.getShopId());
    const { shouldRestock } = this.state;

    if (hasPermission && shouldRestock) {
      return console.log(" ----- ----- ----- handleInventoryRestock for item ", item);
    }

    return null;
  }

  renderCancelOrderButton = () => {
    const hasPermission = Reaction.hasPermission("reaction-orders", Reaction.getUserId(), Reaction.getShopId());
    const { order } = this.props;
    const { shouldRestock } = this.state;
    const canCancelOrder = (order.status !== "coreOrderWorkflow/canceled");

    if (hasPermission) {
      if (canCancelOrder) {
        return (
          <Mutation mutation={cancelOrderItemMutation}>
            {(mutationFunc) => (
              <ConfirmButton
                buttonColor="danger"
                buttonText={i18next.t("order.cancelOrderLabel", "Cancel order")}
                buttonVariant="contained"
                cancelActionText={i18next.t("app.close", "Close")}
                confirmActionText={i18next.t("order.cancelOrderLabel", "Cancel order")}
                title={i18next.t("order.cancelOrderLabel", "Cancel order")}
                message={i18next.t("order.cancelOrder", "Do you want to cancel this order?")}
                onConfirm={() => this.handleCancelOrder(mutationFunc)}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={shouldRestock}
                      onChange={this.handleInventoryRestockCheckbox("shouldRestock")}
                      value="shouldRestock"
                    />
                  }
                  label={i18next.t("order.restockInventory", "Restock inventory?")}
                />
              </ConfirmButton>
            )}
          </Mutation>
        );
      }
    }

    return null;
  }

  render() {
    return (
      <PrimaryAppBar title={i18next.t("orderDetails", "Order details")}>
        {this.renderCancelOrderButton()}
      </PrimaryAppBar>
    );
  }
}

export default OrderCardAppBar;
