import React, { Component } from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import withStyles from "@material-ui/core/styles/withStyles";
import AppBar from "@material-ui/core/AppBar";
import Button from "@material-ui/core/Button";
import Modal from "@material-ui/core/Modal";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { i18next, Logger, Reaction } from "/client/api";
import cancelOrderItemMutation from "../graphql/mutations/cancelOrderItem";


const styles = (theme) => ({
  root: {
    display: "flex",
    height: `calc(100vh - ${theme.mixins.toolbar.minHeight}px)`,
    overflow: "hidden"
  },
  orderCard: {
    marginTop: theme.spacing.unit * 2.5
  },
  toolbarButton: {
    marginLeft: theme.spacing.unit
  },
  leftSidebarOpen: {
    paddingLeft: 280 + (theme.spacing.unit * 2)
  },
  paper: {
    position: "absolute",
    width: theme.spacing.unit * 80,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing.unit * 4,
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)"
  },
  title: {
    flex: 1
  }
});

class OrderCardAppBar extends Component {
  static propTypes = {
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

  handleCancelOrder(mutation) {
    Alerts.alert({
      title: i18next.t("order.cancelOrder"),
      type: "warning",
      showCancelButton: true
    }, async (isConfirm) => {
      if (isConfirm) {
        const { order } = this.props;
        const { fulfillmentGroups } = order;

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
    });
  }

  render() {
    const { classes, order } = this.props;

    const {
      isModalOpen,
      modalMode,
      navigationItem
    } = this.state;

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

          <Typography className={classes.title} variant="h6">Main Navigation</Typography>

          {canCancelOrder &&
            <Mutation mutation={cancelOrderItemMutation}>
              {(mutationFunc) => (
                <Button className={classes.toolbarButton} color="secondary" variant="outlined" onClick={() => { this.handleCancelOrder(mutationFunc); }}>Cancel order</Button>
              )}

            </Mutation>
          }
          <Button className={classes.toolbarButton} color="primary" variant="contained">Capture payment</Button>
        </Toolbar>
      </AppBar>
    );
  }
}

export default withStyles(styles, { name: "OrderCard" })(OrderCardAppBar);
