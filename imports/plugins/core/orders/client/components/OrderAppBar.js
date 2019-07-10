import React, { Component } from "react";
import PropTypes from "prop-types";
import { Mutation } from "react-apollo";
import { i18next, Reaction } from "/client/api";
import ConfirmButton from "/imports/client/ui/components/ConfirmButton";
import PrimaryAppBar from "/imports/client/ui/components/PrimaryAppBar/PrimaryAppBar";
import cancelOrderItemMutation from "../graphql/mutations/cancelOrderItem";

class OrderAppBar extends Component {
  static propTypes = {
    classes: PropTypes.object,
    order: PropTypes.shape({
      status: PropTypes.string
    })
  }

  handleCancelOrder = (mutation) => {
    const hasPermission = Reaction.hasPermission("reaction-orders", Reaction.getUserId(), Reaction.getShopId());

    if (hasPermission) {
      const { order } = this.props;
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
        });
      });
    }

    return null;
  }

  renderCancelOrderButton = () => {
    const hasPermission = Reaction.hasPermission("reaction-orders", Reaction.getUserId(), Reaction.getShopId());
    const { order } = this.props;
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
              />
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

export default OrderAppBar;
