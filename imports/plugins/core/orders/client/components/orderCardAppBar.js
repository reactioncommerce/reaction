import React, { Component } from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import { Mutation } from "react-apollo";
import withStyles from "@material-ui/core/styles/withStyles";
import AppBar from "@material-ui/core/AppBar";
import Button from "@material-ui/core/Button";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { i18next } from "/client/api";
import ConfirmButton from "/imports/client/ui/components/ConfirmButton";
import cancelOrderItemMutation from "../graphql/mutations/cancelOrderItem";


const styles = (theme) => ({
  toolbarButton: {
    marginLeft: theme.spacing.unit
  },
  leftSidebarOpen: {
    paddingLeft: 280 + (theme.spacing.unit * 2)
  },
  title: {
    flex: 1
  }
});

class OrderCardAppBar extends Component {
  static propTypes = {
    classes: PropTypes.object,
    order: PropTypes.shape({
      summary: PropTypes.shape({
        fulfillmentTotal: PropTypes.shape({
          displayAmount: PropTypes.string
        }),
        itemTotal: PropTypes.shape({
          displayAmount: PropTypes.string
        }),
        surchargeTotal: PropTypes.shape({
          displayAmount: PropTypes.string
        }),
        taxTotal: PropTypes.shape({
          displayAmount: PropTypes.string
        }),
        total: PropTypes.shape({
          displayAmount: PropTypes.string
        })
      })
    })
  }

  state = {}

  handleCancelOrder(mutation, shouldRestock) {
    const { order } = this.props;
    const { fulfillmentGroups } = order;

    if (shouldRestock) {
      return console.log("Order should be restocked");
    }

    return console.log("Order should NOT be restocked");

    // We need to loop over every fulfillmentGroup
    // and then loop over every item inside group
    fulfillmentGroups.forEach(async (fulfillmentGroup) => {
      // for (const item of fulfillmentGroup.items.nodes) {
      fulfillmentGroup.items.nodes.forEach(async (item) => {
        console.log(" --- item to cancel", item);

        await mutation({
          variables: {
            input: {
              cancelQuantity: item.quantity,
              itemId: item._id,
              orderId: order._id,
              reason: "Order cancelled inside Catalyst operator UI"
            }
          }
        });
      });
    });
  }

  handleCapturePayment = () => {
    console.log("payment captured");
  }

  render() {
    const { classes, order } = this.props;

    const uiState = {
      isLeftDrawerOpen: false
    };

    const toolbarClassName = classnames({
      [classes.leftSidebarOpen]: uiState.isLeftDrawerOpen
    });


    const canCancelOrder = (order.status !== "coreOrderWorkflow/canceled");


    return (
      <AppBar color="default">
        <Toolbar className={toolbarClassName}>

          <Typography className={classes.title} variant="h6">Order details</Typography>

          {canCancelOrder &&
            <Mutation mutation={cancelOrderItemMutation}>
              {(mutationFunc) => (
                <ConfirmButton
                  buttonColor="danger"
                  buttonText={i18next.t("order.cancelOrderLabel")}
                  buttonVariant="outlined"
                  cancelActionText="No"
                  confirmActionText={i18next.t("order.cancelOrderThenRestock")}
                  title={i18next.t("order.cancelOrderLabel")}
                  message={i18next.t("order.cancelOrder")}
                  onConfirm={() => this.handleCancelOrder(mutationFunc, true)}
                  onSecondaryConfirm={() => this.handleCancelOrder(mutationFunc, false)}
                  secondaryConfirmActionText={i18next.t("order.cancelOrderNoRestock")}
                />
              )}

            </Mutation>
          }
          <Button className={classes.toolbarButton} color="primary" variant="contained" onClick={this.handleCapturePayment}>Capture payment</Button>
        </Toolbar>
      </AppBar>
    );
  }
}

export default withStyles(styles, { name: "MuiOrderCard" })(OrderCardAppBar);
