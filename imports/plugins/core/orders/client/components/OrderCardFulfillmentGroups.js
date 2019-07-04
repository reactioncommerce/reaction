import React, { Component } from "react";
import PropTypes from "prop-types";
import { Mutation } from "react-apollo";
import withStyles from "@material-ui/core/styles/withStyles";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Checkbox from "@material-ui/core/Checkbox";
import Divider from "@material-ui/core/Divider";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Grid from "@material-ui/core/Grid";
import Hidden from "@material-ui/core/Hidden";
import Typography from "@material-ui/core/Typography";
import Address from "@reactioncommerce/components/Address/v1";
import { i18next, Reaction } from "/client/api";
import ConfirmButton from "/imports/client/ui/components/ConfirmButton";
import OrderCardFulfillmentGroupTrackingNumber from "./orderCardFulfillmentGroupTrackingNumber";
import OrderCardStatusChip from "./orderCardStatusChip";
import ConfirmDialog from "/imports/client/ui/components/ConfirmDialog";

import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import OutlinedInput from "@material-ui/core/OutlinedInput";
import { Components } from "@reactioncommerce/reaction-components";
import updateOrderFulfillmentGroupMutation from "../graphql/mutations/updateOrderFulfillmentGroup";
import cancelOrderItemMutation from "../graphql/mutations/cancelOrderItem";
import OrderCardFulfillmentGroupItem from "./orderCardFulfillmentGroupItem";


const styles = (theme) => ({
  fulfillmentGroupHeader: {
    marginBottom: theme.spacing.unit * 4
  },
  fulfillmentSelect: {
    height: "37px",
    minWidth: "205px",
    marginBottom: "-15px"
  },
  printShippingLabelLink: {
    marginRight: theme.spacing.unit * 2
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
      fulfillmentGroups: PropTypes.array
    })
  };

  state = {
    shouldRestock: true
  };

  handleCancelFulfillmentGroup(mutation, fulfillmentGroup) {
    const hasPermission = Reaction.hasPermission("reaction-orders", Reaction.getUserId(), Reaction.getShopId());

    if (hasPermission) {
      const { order } = this.props;
      const { shouldRestock } = this.state;

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

        // TODO: EK - move inventory out of this file?
        if (shouldRestock) {
          this.handleInventoryRestock(item);
        }
      });
    }
  }

  // TODO: EK - move inventory out of this file?
  handleInventoryRestockCheckbox = (name) => (event) => {
    const hasPermission = Reaction.hasPermission("reaction-orders", Reaction.getUserId(), Reaction.getShopId());

    if (hasPermission) {
      this.setState({
        ...this.state,
        [name]: event.target.checked
      });
    }
  };

  // TODO: EK - move inventory out of this file?
  handleInventoryRestock = (item) => {
    const hasPermission = Reaction.hasPermission("reaction-orders", Reaction.getUserId(), Reaction.getShopId());

    if (hasPermission) {
      // TODO: EK - handle inventory restock
      console.log(" ----- ----- ----- Handle restocking item", item._id);
    }
  }

  // TODO: EK - what do we do when people click this
  handlePrintShippingLabel(fulfillmentGroup) {
    console.log(" ----- ----- ----- ----- Print shipping label button has been clicked for fulfillment group", fulfillmentGroup._id);
  }

  async handleUpdateFulfillmentGroupStatus(mutation, fulfillmentGroup) {
    const hasPermission = Reaction.hasPermission("reaction-orders", Reaction.getUserId(), Reaction.getShopId());
    console.log(" ----- ----- ----- ----- handleUpdateFulfillmentGroupStatus", fulfillmentGroup.status, fulfillmentGroup);

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

      // TODO: EK - do we need to loop over items?
      // We need to loop over every fulfillmentGroup
      // and then loop over every item inside group
      // fulfillmentGroup.items.nodes.forEach(async (item) => {
      //   await mutation({
      //     variables: {
      //       orderFulfillmentGroupId: fulfillmentGroup.id,
      //       orderId: order._id,
      //       status: fulfillmentGroup.id
      //     }
      //   });

      //   if (shouldRestock) {
      //     this.handleInventoryRestock(item);
      //   }
      // });
    }
  }

  printShippingLabelLink() {
    const { order } = this.props;

    return Reaction.Router.pathFor("dashboard/pdf/orders", {
      hash: {
        id: order.referenceId
      }
    });
  }


  renderFulfillmentGroupItems(fulfillmentGroup) {
    return fulfillmentGroup.items.nodes.map((item) => (
      <Grid key={item._id} item xs={12}>
        <OrderCardFulfillmentGroupItem item={item} />
      </Grid>
    ));
  }

  renderCancelFulfillmentGroupButton = (fulfillmentGroup) => {
    const hasPermission = Reaction.hasPermission("reaction-orders", Reaction.getUserId(), Reaction.getShopId());
    // "new": "New ",
    //           "coreOrderWorkflow/created": "Created ",
    //           "coreOrderWorkflow/processing": "Processing ",
    //           "coreOrderWorkflow/completed": "Completed ",
    //           "coreOrderWorkflow/canceled": "Canceled ",
    //           "coreOrderWorkflow/picked": "Picked ",
    //           "coreOrderWorkflow/packed": "Packed ",
    //           "coreOrderWorkflow/labeled": "Labeled ",
    //           "coreOrderWorkflow/shipped": "Shipped "

    //           the main ones for overall order are"
    //           "coreOrderWorkflow/processing": "Processing ",
    //           "coreOrderWorkflow/completed": "Completed ",
    //           "coreOrderWorkflow/canceled": "Canceled ",


    if (hasPermission) {
      const canCancelOrder = (fulfillmentGroup.status !== "coreOrderWorkflow/canceled");
      const { shouldRestock } = this.state;

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
                >
                  {/* TODO: EK - move inventory out of this file? */}
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={shouldRestock}
                        onChange={this.handleInventoryRestockCheckbox("shouldRestock")}
                        value="shouldRestock"
                      />
                    }
                    label={i18next.t("order.restockInventory")}
                  />
                </ConfirmButton>
              )}
            </Mutation>
          </Grid>
        );
      }
    }

    return null;
  }

  renderPrintShippingLabelLink = (fulfillmentGroup) => {
    const showLink = true; // TODO: EK - remove this, find the real check to use here

    if (showLink) {
      return (
        <Grid item>
          <Button
            onClick={this.printShippingLabelLink}
            variant="text"
          >
            {i18next.t("admin.fulfillmentGroups.printShippingLabel", "Print shipping label")}
          </Button>
        </Grid>
      );
    }

    return null;
  }


  handleSelectChange = (event, value, field) => {
    console.log(" ------ handle select change", event, value, field);

    // if (this.props.onProductFieldSave) {
    //   this.props.onProductFieldSave(this.product._id, field, value);
    // }
  }


  renderUpdateFulfillmentGroupStatusButton = (fulfillmentGroup) => {
    const hasPermission = Reaction.hasPermission("reaction-orders", Reaction.getUserId(), Reaction.getShopId());
    const { classes } = this.props;
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
                buttonColor="primary"
                buttonText={i18next.t("orderActions.updateGroupStatusLabel", "Update group status")}
                buttonVariant="contained"
                cancelActionText={i18next.t("app.close")}
                confirmActionText={i18next.t("orderActions.updateGroupStatusLabel", "Update group status")}
                title={i18next.t("orderActions.updateGroupStatusLabel", "Update group status")}
                message={i18next.t("order.updateGroupStatusDescription", "Update status for group and all items in it")}
                onConfirm={() => this.handleUpdateFulfillmentGroupStatus(mutationFunc, fulfillmentGroup)}
              >
                <Components.Select
                  className={classes.fulfillmentSelect}
                  clearable={false}
                  i18nKeyPlaceholder="orderActions.selectPrompt"
                  name="fulfillmentStatus"
                  onChange={this.handleSelectChange}
                  placeholder="Select new group status"
                  ref="updateFulfillmentStatusInput"
                  value={activeOption}
                  options={options}
                />
              </ConfirmButton>
            )}
          </Mutation>
        </Grid>
      );
    }

    return null;

    if (canUpdateFulfillmentStatus) {
      if (fulfillmentGroup.status === "new") {
        return (
          <Grid item>
            <Mutation mutation={updateOrderFulfillmentGroupMutation}>
              {(mutationFunc) => (
                <ConfirmButton
                  buttonColor="primary"
                  buttonText={i18next.t("orderActions.markAsPackedLabel", "Mark as packed")}
                  buttonVariant="contained"
                  cancelActionText={i18next.t("app.close")}
                  confirmActionText={i18next.t("orderActions.markAsPackedLabel", "Mark as packed")}
                  title={i18next.t("orderActions.updateGroupStatus", "Update group status")}
                  message={i18next.t("order.markAsPackedDescription", "Mark all items in this fulfillment group as \"Packed\"")}
                  onConfirm={() => this.handleUpdateFulfillmentGroupStatus(mutationFunc, fulfillmentGroup)}
                >
                  {/* <FormControlLabel
                    control={
                      <Checkbox
                        checked={shouldRestock}
                        onChange={this.handleInventoryRestockCheckbox("shouldRestock")}
                        value="shouldRestock"
                      />
                    }
                    label={i18next.t("order.restockInventory")}
                  /> */}
                </ConfirmButton>
              )}
            </Mutation>
          </Grid>
        );
      }
    }

    //   if (fulfillmentGroup.status === "coreOrderWorkflow/packed") {
    //     return (
    //       <Grid item>
    //         <Mutation mutation={updateOrderFulfillmentGroupMutation}>
    //           {(mutationFunc) => (
    //             <ConfirmButton
    //               buttonColor="primary"
    //               buttonText={i18next.t("orderActions.markAsShippedLabel", "Mark as shipped")}
    //               buttonVariant="contained"
    //               cancelActionText={i18next.t("app.close")}
    //               confirmActionText={i18next.t("orderActions.markAsShippedLabel", "Mark as shipped")}
    //               title={i18next.t("orderActions.updateGroupStatus", "Update group status")}
    //               message={i18next.t("order.markAsShippedDescription", "Mark all items in this fulfillment group as \"Shipped\"")}
    //               onConfirm={() => this.handleUpdateFulfillmentGroupStatus(mutationFunc, fulfillmentGroup)}
    //             >
    //               {/* <FormControlLabel
    //                 control={
    //                   <Checkbox
    //                     checked={shouldRestock}
    //                     onChange={this.handleInventoryRestockCheckbox("shouldRestock")}
    //                     value="shouldRestock"
    //                   />
    //                 }
    //                 label={i18next.t("order.restockInventory")}
    //               /> */}
    //             </ConfirmButton>
    //           )}
    //         </Mutation>
    //       </Grid>
    //     );
    //   }

    //   // return (
    //   //   <Mutation mutation={updateOrderFulfillmentGroupMutation}>
    //   //     {(mutationFunc) => (
    //   //       <ConfirmButton
    //   //         buttonColor="primary"
    //   //         buttonText={i18next.t("order.updateGroupStatus", "Update group status")}
    //   //         buttonVariant="contained"
    //   //         cancelActionText={i18next.t("app.close")}
    //   //         confirmActionText={i18next.t("order.updateStatus", "Update group status")}
    //   //         title={i18next.t("order.updateGroupStatus", "Update status")}
    //   //         message={i18next.t("order.updateGroupStatus", "Update group status")}
    //   //         onConfirm={() => this.handleUpdateFulfillmentGroupStatus(mutationFunc, fulfillmentGroup)}
    //   //       >
    //   //         {/* <FormControlLabel
    //   //           control={
    //   //             <Checkbox
    //   //               checked={shouldRestock}
    //   //               onChange={this.handleInventoryRestockCheckbox("shouldRestock")}
    //   //               value="shouldRestock"
    //   //             />
    //   //           }
    //   //           label={i18next.t("order.restockInventory")}
    //   //         /> */}
    //   //       </ConfirmButton>
    //   //     )}
    //   //   </Mutation>
    //   // );
    //   if (fulfillmentGroup.status === "coreOrderWorkflow/shipped") {
    //     return "it's shipped";
    //   }
    // }
  }

  renderFulfillmentGroups = () => {
    const { classes, order } = this.props;
    const { fulfillmentGroups } = order;
    const totalGroupsCount = fulfillmentGroups.length;

    return fulfillmentGroups.map((fulfillmentGroup, index) => {
      console.log(" ------------------------------- fulfillmentGroup", fulfillmentGroup);

      const currentGroupCount = index + 1;
      const { data: { shippingAddress }, displayStatus, status } = fulfillmentGroup;

      return (
        <Grid key={fulfillmentGroup._id} item xs={12}>
          <Card elevation={0}>
            <CardContent>
              <Grid container alignItems="center" className={classes.fulfillmentGroupHeader}>
                {/* TODO: EK - make this a spacing heading instread of class */}
                <Grid item xs={6} md={6}>
                  <Grid container alignItems="center" spacing={16}>
                    <Grid item>
                      <Typography variant="h4" inline={true}>
                        Fulfillment group {currentGroupCount} of {totalGroupsCount}
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
                  <Typography variant="h4">Items</Typography>
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
                        Shipping address
                      </Typography>
                      <Address address={shippingAddress} />
                    </Grid>
                    <Grid item xs={12} md={12}>
                      <Typography paragraph variant="h4">
                      Shipping method
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
                      Tracking number
                      </Typography>
                      <OrderCardFulfillmentGroupTrackingNumber orderId={order._id} fulfillmentGroup={fulfillmentGroup} {...this.props}/>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      );
    });
  }

  render() {
    return (
      <Grid container spacing={32}>
        {this.renderFulfillmentGroups()}
      </Grid>
    );
  }
}

export default withStyles(styles, { name: "RuiOrderCardFulfillmentGroups" })(OrderCardFulfillmentGroups);
