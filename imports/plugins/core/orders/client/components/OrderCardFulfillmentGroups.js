import React, { Component } from "react";
import PropTypes from "prop-types";
import { Mutation } from "react-apollo";
import withStyles from "@material-ui/core/styles/withStyles";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Divider from "@material-ui/core/Divider";
import Grid from "@material-ui/core/Grid";
import Hidden from "@material-ui/core/Hidden";
import Typography from "@material-ui/core/Typography";
import Address from "@reactioncommerce/components/Address/v1";
import { i18next, Reaction } from "/client/api";
import ConfirmButton from "/imports/client/ui/components/ConfirmButton";
import cancelOrderItemMutation from "../graphql/mutations/cancelOrderItem";
import OrderCardFulfillmentGroupItem from "./OrderCardFulfillmentGroupItem";
import OrderCardFulfillmentGroupTrackingNumber from "./OrderCardFulfillmentGroupTrackingNumber";
import OrderCardFulfillmentGroupStatusButton from "./OrderCardFulfillmentGroupStatusButton";
import OrderCardStatusChip from "./OrderCardStatusChip";

const styles = (theme) => ({
  fulfillmentGroupHeader: {
    marginBottom: theme.spacing.unit * 4
  },
  verticalDivider: {
    backgroundColor: "#e6e6e6",
    height: "100%",
    margin: "auto",
    width: "1px"
  },
  [theme.breakpoints.up("md")]: {
    gridItemNeedingDivider: {
      maxWidth: "46%",
      flexBasis: "46%"
    },
    gridItemWithDivider: {
      maxWidth: "4%",
      flexBasis: "4%"
    }
  }
});

class OrderCardFulfillmentGroups extends Component {
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

  getPrintShippingLabelLink() {
    const { order } = this.props;

    return Reaction.Router.pathFor("dashboard/pdf/orders", {
      hash: {
        id: order.referenceId
      }
    });
  }

  handleCancelFulfillmentGroup(mutation, fulfillmentGroup) {
    const hasPermission = Reaction.hasPermission("reaction-orders", Reaction.getUserId(), Reaction.getShopId());

    if (hasPermission) {
      const { order } = this.props;

      // We need to loop over every fulfillmentGroup
      // and then loop over every item inside group
      fulfillmentGroup.items.nodes.forEach(async (item) => {
        await mutation({
          variables: {
            cancelQuantity: item.quantity,
            itemId: item._id,
            orderId: order._id,
            reason: "Fulfillment group cancelled via Catalyst"
          }
        });
      });
    }
  }

  // TODO: EK - what do we do when people click this
  // TODO: EK - this function
  handlePrintShippingLabel(fulfillmentGroup) {
    console.log(" ----- ----- ----- ----- Print shipping label button has been clicked for fulfillment group", fulfillmentGroup._id);
  }

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

  renderCancelFulfillmentGroupButton = (fulfillmentGroup) => {
    const hasPermission = Reaction.hasPermission("reaction-orders", Reaction.getUserId(), Reaction.getShopId());

    if (hasPermission) {
      const canCancelOrder = (fulfillmentGroup.status !== "coreOrderWorkflow/canceled");

      if (canCancelOrder) {
        return (
          <Grid item>
            <Mutation mutation={cancelOrderItemMutation}>
              {(mutationFunc) => (
                <ConfirmButton
                  buttonColor="danger"
                  buttonText={i18next.t("order.cancelGroupLabel", "Cancel group")}
                  buttonVariant="outlined"
                  cancelActionText={i18next.t("app.close")}
                  confirmActionText={i18next.t("order.cancelGroupLabel", "Cancel group")}
                  title={i18next.t("order.cancelGroupLabel")}
                  message={i18next.t("order.cancelGroup")}
                  onConfirm={() => this.handleCancelFulfillmentGroup(mutationFunc, fulfillmentGroup)}
                />
              )}
            </Mutation>
          </Grid>
        );
      }
    }

    return null;
  }

  renderFulfillmentGroupItems(fulfillmentGroup) {
    return fulfillmentGroup.items.nodes.map((item) => (
      <Grid key={item._id} item xs={12}>
        <OrderCardFulfillmentGroupItem item={item} />
      </Grid>
    ));
  }

  // TODO: EK - this function
  renderPrintShippingLabelLink = (fulfillmentGroup) => {
    const showLink = true; // TODO: EK - remove this, find the real check to use here

    if (showLink) {
      return (
        <Grid item>
          <Button
            onClick={this.getPrintShippingLabelLink}
            variant="text"
          >
            {i18next.t("admin.fulfillmentGroups.printShippingLabel", "Print shipping label")}
          </Button>
        </Grid>
      );
    }

    return null;
  }

  renderUpdateFulfillmentGroupStatusButton = (fulfillmentGroup) => {
    const hasPermission = Reaction.hasPermission("reaction-orders", Reaction.getUserId(), Reaction.getShopId());
    const canUpdateFulfillmentStatus = (fulfillmentGroup.status !== "coreOrderWorkflow/canceled");

    if (hasPermission && canUpdateFulfillmentStatus) {
      return (
        <Grid item>
          <OrderCardFulfillmentGroupStatusButton fulfillmentGroup={fulfillmentGroup} />
        </Grid>
      );
    }

    return null;
  }

  render() {
    const { classes, order } = this.props;
    const { fulfillmentGroups } = order;
    const totalGroupsCount = fulfillmentGroups.length;

    return fulfillmentGroups.map((fulfillmentGroup, index) => {
      const currentGroupCount = index + 1;
      const { data: { shippingAddress }, displayStatus, status } = fulfillmentGroup;

      return (
        <Grid container spacing={32}>
          <Grid key={fulfillmentGroup._id} item xs={12}>
            <Card elevation={0}>
              <CardContent>
                <Grid container alignItems="center" className={classes.fulfillmentGroupHeader}>
                  <Grid item xs={6} md={6}>
                    <Grid container alignItems="center" spacing={16}>
                      <Grid item>
                        <Typography variant="h4" inline={true}>
                          {i18next.t("order.fulfillmentGroupHeader", `Fulfillment group ${currentGroupCount} of ${totalGroupsCount}`)}
                        </Typography>
                      </Grid>
                      <Grid item>
                        <OrderCardStatusChip displayStatus={displayStatus} status={status} type="shipment" variant="contained" />
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={6} md={6}>
                    <Grid container alignItems="center" justify="flex-end" spacing={8}>
                      {this.renderPrintShippingLabelLink(fulfillmentGroup)}
                      {this.renderCancelFulfillmentGroupButton(fulfillmentGroup)}
                      {this.renderUpdateFulfillmentGroupStatusButton(fulfillmentGroup)}
                    </Grid>
                  </Grid>
                </Grid>
                <Grid container spacing={24}>
                  <Grid item xs={12} md={12}>
                    <Typography variant="h4">{i18next.t("order.items", "Items")}</Typography>
                  </Grid>
                  <Grid className={classes.gridItemNeedingDivider} item xs={12} md={5}>
                    <Grid container spacing={40}>
                      {this.renderFulfillmentGroupItems(fulfillmentGroup)}
                    </Grid>
                  </Grid>
                  <Hidden only={["xs", "sm"]}>
                    <Grid className={classes.gridItemWithDivider} item xs={2}>
                      <div className={classes.verticalDivider}>&nbsp;</div>
                    </Grid>
                  </Hidden>
                  <Hidden only={["md", "lg", "xl"]}>
                    <Grid item xs={12}>
                      <Divider />
                    </Grid>
                  </Hidden>
                  <Grid className={classes.gridItemNeedingDivider} item xs={12} md={5}>
                    <Grid container spacing={32}>
                      <Grid item xs={12} md={12}>
                        <Typography paragraph variant="h4">
                          {i18next.t("order.shippingAddress", "Shipping address")}
                        </Typography>
                        <Address address={shippingAddress} />
                      </Grid>
                      <Grid item xs={12} md={12}>
                        <Typography paragraph variant="h4">
                          {i18next.t("order.shippingMethod", "Shipping method")}
                        </Typography>
                        <Typography
                          key={fulfillmentGroup._id}
                          variant="body1"
                        >
                          {fulfillmentGroup.selectedFulfillmentOption.fulfillmentMethod.carrier} - {fulfillmentGroup.selectedFulfillmentOption.fulfillmentMethod.displayName} {/* eslint-disable-line */}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={12}>
                        <Typography paragraph variant="h4">
                          {i18next.t("order.trackingNumber", "Tracking number")}
                        </Typography>
                        <OrderCardFulfillmentGroupTrackingNumber orderId={order._id} fulfillmentGroup={fulfillmentGroup} {...this.props}/>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      );
    });
  }
}

export default withStyles(styles, { name: "RuiOrderCardFulfillmentGroups" })(OrderCardFulfillmentGroups);
