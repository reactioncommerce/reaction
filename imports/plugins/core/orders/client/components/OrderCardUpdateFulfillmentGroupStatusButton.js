// import React, { Component } from "react";
// import PropTypes from "prop-types";
// import { Mutation } from "react-apollo";
// import withStyles from "@material-ui/core/styles/withStyles";
// import Button from "@material-ui/core/Button";
// import Card from "@material-ui/core/Card";
// import CardContent from "@material-ui/core/CardContent";
// import Checkbox from "@material-ui/core/Checkbox";
// import Divider from "@material-ui/core/Divider";
// import FormControlLabel from "@material-ui/core/FormControlLabel";
// import Grid from "@material-ui/core/Grid";
// import Hidden from "@material-ui/core/Hidden";
// import Typography from "@material-ui/core/Typography";
// import Address from "@reactioncommerce/components/Address/v1";
// import { i18next, Reaction } from "/client/api";
// import ConfirmButton from "/imports/client/ui/components/ConfirmButton";
// import cancelOrderItemMutation from "../graphql/mutations/cancelOrderItem";
// import updateOrderFulfillmentGroupMutation from "../graphql/mutations/updateOrderFulfillmentGroup";
// import OrderCardFulfillmentGroupItem from "./orderCardFulfillmentGroupItem";
// import OrderCardFulfillmentGroupTrackingNumber from "./orderCardFulfillmentGroupTrackingNumber";
// import OrderCardStatusChip from "./orderCardStatusChip";





// import ButtonGroup from '@material-ui/core/ButtonGroup';
// import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
// import ClickAwayListener from '@material-ui/core/ClickAwayListener';
// import Grow from '@material-ui/core/Grow';
// import Paper from '@material-ui/core/Paper';
// import Popper from '@material-ui/core/Popper';
// import MenuItem from '@material-ui/core/MenuItem';
// import MenuList from '@material-ui/core/MenuList';

// const options = ['Create a merge commit', 'Squash and merge', 'Rebase and merge'];

// function SplitButton() {
//   const [open, setOpen] = React.useState(false);
//   const anchorRef = React.useRef(null);
//   const [selectedIndex, setSelectedIndex] = React.useState(1);

//   function handleClick() {
//     alert(`You clicked ${options[selectedIndex]}`);
//   }

//   function handleMenuItemClick(event, index) {
//     setSelectedIndex(index);
//     setOpen(false);
//   }

//   function handleToggle() {
//     setOpen(prevOpen => !prevOpen);
//   }

//   function handleClose(event) {
//     if (anchorRef.current && anchorRef.current.contains(event.target)) {
//       return;
//     }

//     setOpen(false);
//   }

//   return (
//     <Grid container>
//       <Grid item xs={12} align="center">
//         <ButtonGroup variant="contained" color="primary" ref={anchorRef} aria-label="Split button">
//           <Button onClick={handleClick}>{options[selectedIndex]}</Button>
//           <Button
//             color="primary"
//             variant="contained"
//             size="small"
//             aria-owns={open ? 'menu-list-grow' : undefined}
//             aria-haspopup="true"
//             onClick={handleToggle}
//           >
//             <ArrowDropDownIcon />
//           </Button>
//         </ButtonGroup>
//         <Popper open={open} anchorEl={anchorRef.current} transition disablePortal>
//           {({ TransitionProps, placement }) => (
//             <Grow
//               {...TransitionProps}
//               style={{
//                 transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom',
//               }}
//             >
//               <Paper id="menu-list-grow">
//                 <ClickAwayListener onClickAway={handleClose}>
//                   <MenuList>
//                     {options.map((option, index) => (
//                       <MenuItem
//                         key={option}
//                         disabled={index === 2}
//                         selected={index === selectedIndex}
//                         onClick={event => handleMenuItemClick(event, index)}
//                       >
//                         {option}
//                       </MenuItem>
//                     ))}
//                   </MenuList>
//                 </ClickAwayListener>
//               </Paper>
//             </Grow>
//           )}
//         </Popper>
//       </Grid>
//     </Grid>
//   );
// }

// export default SplitButton;






// // class OrderCardFulfillmentGroups extends Component {
// //   static propTypes = {
// //     classes: PropTypes.object,
// //     order: PropTypes.shape({
// //       fulfillmentGroups: PropTypes.array
// //     })
// //   };

// //   state = {
// //     shouldRestock: true
// //   };

// //   handleCancelFulfillmentGroup(mutation, fulfillmentGroup) {
// //     const hasPermission = Reaction.hasPermission("reaction-orders", Reaction.getUserId(), Reaction.getShopId());

// //     if (hasPermission) {
// //       const { order } = this.props;
// //       const { shouldRestock } = this.state;

// //       // We need to loop over every fulfillmentGroup
// //       // and then loop over every item inside group
// //       fulfillmentGroup.items.nodes.forEach(async (item) => {
// //         await mutation({
// //           variables: {
// //             cancelQuantity: item.quantity,
// //             itemId: item._id,
// //             orderId: order._id,
// //             reason: "Fulfillment group cancelled via Catalyst"
// //           }
// //         });

// //         // TODO: EK - move inventory out of this file?
// //         if (shouldRestock) {
// //           this.handleInventoryRestock(item);
// //         }
// //       });
// //     }
// //   }

// //   // TODO: EK - move inventory out of this file?
// //   handleInventoryRestockCheckbox = (name) => (event) => {
// //     const hasPermission = Reaction.hasPermission("reaction-orders", Reaction.getUserId(), Reaction.getShopId());

// //     if (hasPermission) {
// //       this.setState({
// //         ...this.state,
// //         [name]: event.target.checked
// //       });
// //     }
// //   };

// //   // TODO: EK - move inventory out of this file?
// //   handleInventoryRestock = (item) => {
// //     const hasPermission = Reaction.hasPermission("reaction-orders", Reaction.getUserId(), Reaction.getShopId());

// //     if (hasPermission) {
// //       // TODO: EK - handle inventory restock
// //       console.log(" ----- ----- ----- Handle restocking item", item._id);
// //     }
// //   }

// //   // TODO: EK - what do we do when people click this
// //   handlePrintShippingLabel(fulfillmentGroup) {
// //     console.log(" ----- ----- ----- ----- Print shipping label button has been clicked for fulfillment group", fulfillmentGroup._id);
// //   }

// //   async handleUpdateFulfillmentGroupStatus(mutation, fulfillmentGroup) {
// //     const hasPermission = Reaction.hasPermission("reaction-orders", Reaction.getUserId(), Reaction.getShopId());
// //     console.log(" ----- ----- ----- ----- handleUpdateFulfillmentGroupStatus", fulfillmentGroup.status, fulfillmentGroup);

// //     if (hasPermission) {
// //       const { order } = this.props;
// //       let status;

// //       if (fulfillmentGroup.status === "new") {
// //         status = "coreOrderWorkflow/packed";
// //       }

// //       if (fulfillmentGroup.status === "coreOrderWorkflow/packed") {
// //         status = "coreOrderWorkflow/shipped";
// //       }

// //       await mutation({
// //         variables: {
// //           orderFulfillmentGroupId: fulfillmentGroup._id,
// //           orderId: order._id,
// //           status
// //         }
// //       });

// //       // TODO: EK - do we need to loop over items?
// //       // We need to loop over every fulfillmentGroup
// //       // and then loop over every item inside group
// //       // fulfillmentGroup.items.nodes.forEach(async (item) => {
// //       //   await mutation({
// //       //     variables: {
// //       //       orderFulfillmentGroupId: fulfillmentGroup.id,
// //       //       orderId: order._id,
// //       //       status: fulfillmentGroup.id
// //       //     }
// //       //   });

// //       //   if (shouldRestock) {
// //       //     this.handleInventoryRestock(item);
// //       //   }
// //       // });
// //     }
// //   }

// //   printShippingLabelLink() {
// //     const { order } = this.props;

// //     return Reaction.Router.pathFor("dashboard/pdf/orders", {
// //       hash: {
// //         id: order.referenceId
// //       }
// //     });
// //   }


// //   renderFulfillmentGroupItems(fulfillmentGroup) {
// //     return fulfillmentGroup.items.nodes.map((item) => (
// //       <Grid item xs={12}>
// //         <OrderCardFulfillmentGroupItem key={item._id} item={item} />
// //       </Grid>
// //     ));
// //   }

// //   renderCancelFulfillmentGroupButton = (fulfillmentGroup) => {
// //     const hasPermission = Reaction.hasPermission("reaction-orders", Reaction.getUserId(), Reaction.getShopId());
// //     // "new": "New ",
// //     //           "coreOrderWorkflow/created": "Created ",
// //     //           "coreOrderWorkflow/processing": "Processing ",
// //     //           "coreOrderWorkflow/completed": "Completed ",
// //     //           "coreOrderWorkflow/canceled": "Canceled ",
// //     //           "coreOrderWorkflow/picked": "Picked ",
// //     //           "coreOrderWorkflow/packed": "Packed ",
// //     //           "coreOrderWorkflow/labeled": "Labeled ",
// //     //           "coreOrderWorkflow/shipped": "Shipped "

// //     //           the main ones for overall order are"
// //     //           "coreOrderWorkflow/processing": "Processing ",
// //     //           "coreOrderWorkflow/completed": "Completed ",
// //     //           "coreOrderWorkflow/canceled": "Canceled ",


// //     if (hasPermission) {
// //       const canCancelOrder = (fulfillmentGroup.status !== "coreOrderWorkflow/canceled");
// //       const { shouldRestock } = this.state;

// //       if (canCancelOrder) {
// //         return (
// //           <Grid item>
// //             <Mutation mutation={cancelOrderItemMutation}>
// //               {(mutationFunc) => (
// //                 <ConfirmButton
// //                   buttonColor="danger"
// //                   buttonText={i18next.t("order.cancelGroupLabel", "Cancel group")}
// //                   buttonVariant="outlined"
// //                   cancelActionText={i18next.t("app.close")}
// //                   confirmActionText={i18next.t("order.cancelGroupLabel", "Cancel group")}
// //                   title={i18next.t("order.cancelGroupLabel")}
// //                   message={i18next.t("order.cancelGroup")}
// //                   onConfirm={() => this.handleCancelFulfillmentGroup(mutationFunc, fulfillmentGroup)}
// //                 >
// //                   {/* TODO: EK - move inventory out of this file? */}
// //                   <FormControlLabel
// //                     control={
// //                       <Checkbox
// //                         checked={shouldRestock}
// //                         onChange={this.handleInventoryRestockCheckbox("shouldRestock")}
// //                         value="shouldRestock"
// //                       />
// //                     }
// //                     label={i18next.t("order.restockInventory")}
// //                   />
// //                 </ConfirmButton>
// //               )}
// //             </Mutation>
// //           </Grid>
// //         );
// //       }
// //     }

// //     return null;
// //   }

// //   renderPrintShippingLabelLink = (fulfillmentGroup) => {
// //     const showLink = true; // TODO: EK - remove this, find the real check to use here

// //     if (showLink) {
// //       return (
// //         <Grid item>
// //           <Button
// //             onClick={this.printShippingLabelLink}
// //             variant="text"
// //           >
// //             {i18next.t("admin.fulfillmentGroups.printShippingLabel", "Print shipping label")}
// //           </Button>
// //         </Grid>
// //       );
// //     }

// //     return null;
// //   }

// //   renderUpdateFulfillmentGroupStatusButton = (fulfillmentGroup) => {
// //     const hasPermission = Reaction.hasPermission("reaction-orders", Reaction.getUserId(), Reaction.getShopId());

// //     if (hasPermission) {
// //       const canUpdateFulfillmentStatus = (fulfillmentGroup.status !== "coreOrderWorkflow/canceled");

// //       if (canUpdateFulfillmentStatus) {
// //         if (fulfillmentGroup.status === "new") {
// //           return (
// //             <Grid item>
// //               <Mutation mutation={updateOrderFulfillmentGroupMutation}>
// //                 {(mutationFunc) => (
// //                   <ConfirmButton
// //                     buttonColor="primary"
// //                     buttonText={i18next.t("orderActions.markAsPackedLabel", "Mark as packed")}
// //                     buttonVariant="contained"
// //                     cancelActionText={i18next.t("app.close")}
// //                     confirmActionText={i18next.t("orderActions.markAsPackedLabel", "Mark as packed")}
// //                     title={i18next.t("orderActions.updateGroupStatus", "Update group status")}
// //                     message={i18next.t("order.markAsPackedDescription", "Mark all items in this fulfillment group as \"Packed\"")}
// //                     onConfirm={() => this.handleUpdateFulfillmentGroupStatus(mutationFunc, fulfillmentGroup)}
// //                   >
// //                     {/* <FormControlLabel
// //                       control={
// //                         <Checkbox
// //                           checked={shouldRestock}
// //                           onChange={this.handleInventoryRestockCheckbox("shouldRestock")}
// //                           value="shouldRestock"
// //                         />
// //                       }
// //                       label={i18next.t("order.restockInventory")}
// //                     /> */}
// //                   </ConfirmButton>
// //                 )}
// //               </Mutation>
// //             </Grid>
// //           );
// //         }

// //         if (fulfillmentGroup.status === "coreOrderWorkflow/packed") {
// //           return (
// //             <Grid item>
// //               <Mutation mutation={updateOrderFulfillmentGroupMutation}>
// //                 {(mutationFunc) => (
// //                   <ConfirmButton
// //                     buttonColor="primary"
// //                     buttonText={i18next.t("orderActions.markAsShippedLabel", "Mark as shipped")}
// //                     buttonVariant="contained"
// //                     cancelActionText={i18next.t("app.close")}
// //                     confirmActionText={i18next.t("orderActions.markAsShippedLabel", "Mark as shipped")}
// //                     title={i18next.t("orderActions.updateGroupStatus", "Update group status")}
// //                     message={i18next.t("order.markAsShippedDescription", "Mark all items in this fulfillment group as \"Shipped\"")}
// //                     onConfirm={() => this.handleUpdateFulfillmentGroupStatus(mutationFunc, fulfillmentGroup)}
// //                   >
// //                     {/* <FormControlLabel
// //                       control={
// //                         <Checkbox
// //                           checked={shouldRestock}
// //                           onChange={this.handleInventoryRestockCheckbox("shouldRestock")}
// //                           value="shouldRestock"
// //                         />
// //                       }
// //                       label={i18next.t("order.restockInventory")}
// //                     /> */}
// //                   </ConfirmButton>
// //                 )}
// //               </Mutation>
// //             </Grid>
// //           );
// //         }

// //         // return (
// //         //   <Mutation mutation={updateOrderFulfillmentGroupMutation}>
// //         //     {(mutationFunc) => (
// //         //       <ConfirmButton
// //         //         buttonColor="primary"
// //         //         buttonText={i18next.t("order.updateGroupStatus", "Update group status")}
// //         //         buttonVariant="contained"
// //         //         cancelActionText={i18next.t("app.close")}
// //         //         confirmActionText={i18next.t("order.updateStatus", "Update group status")}
// //         //         title={i18next.t("order.updateGroupStatus", "Update status")}
// //         //         message={i18next.t("order.updateGroupStatus", "Update group status")}
// //         //         onConfirm={() => this.handleUpdateFulfillmentGroupStatus(mutationFunc, fulfillmentGroup)}
// //         //       >
// //         //         {/* <FormControlLabel
// //         //           control={
// //         //             <Checkbox
// //         //               checked={shouldRestock}
// //         //               onChange={this.handleInventoryRestockCheckbox("shouldRestock")}
// //         //               value="shouldRestock"
// //         //             />
// //         //           }
// //         //           label={i18next.t("order.restockInventory")}
// //         //         /> */}
// //         //       </ConfirmButton>
// //         //     )}
// //         //   </Mutation>
// //         // );
// //         if (fulfillmentGroup.status === "coreOrderWorkflow/shipped") {
// //           return "it's shipped";
// //         }
// //       }
// //     }

// //     return null;
// //   }

// //   renderFulfillmentGroups = () => {
// //     const { classes, order } = this.props;
// //     const { fulfillmentGroups } = order;
// //     const totalGroupsCount = fulfillmentGroups.length;

// //     return fulfillmentGroups.map((fulfillmentGroup, index) => {
// //       console.log(" ------------------------------- fulfillmentGroup", fulfillmentGroup);

// //       const currentGroupCount = index + 1;
// //       const { data: { shippingAddress }, displayStatus, status } = fulfillmentGroup;

// //       return (
// //         <Grid item xs={12}>
// //           <Card key={fulfillmentGroup._id} elevation={0}>
// //             <CardContent>
// //               <Grid container alignItems="center" className={classes.fulfillmentGroupHeader}>
// //                 {/* TODO: EK - make this a spacing heading instread of class */}
// //                 <Grid item xs={6} md={6}>
// //                   <Grid container alignItems="center" spacing={16}>
// //                     <Grid item>
// //                       <Typography variant="h4" inline={true}>
// //                         Fulfillment group {currentGroupCount} of {totalGroupsCount}
// //                       </Typography>
// //                     </Grid>
// //                     <Grid item>
// //                       <OrderCardStatusChip displayStatus={displayStatus} status={status} type="shipment" variant="contained" />
// //                     </Grid>
// //                   </Grid>
// //                 </Grid>
// //                 <Grid item xs={6} md={6}>
// //                   <Grid container alignItems="center" justify="flex-end" spacing={8}>
// //                     {this.renderPrintShippingLabelLink(fulfillmentGroup)}
// //                     {this.renderCancelFulfillmentGroupButton(fulfillmentGroup)}
// //                     {this.renderUpdateFulfillmentGroupStatusButton(fulfillmentGroup)}
// //                   </Grid>
// //                 </Grid>
// //               </Grid>
// //               <Grid container spacing={24}>
// //                 <Grid item xs={12} md={12}>
// //                   <Typography variant="h4">Items</Typography>
// //                 </Grid>
// //                 <Grid className={classes.gridItemNeedingDivider} item xs={12} md={5}>
// //                   <Grid container spacing={40}>
// //                     {this.renderFulfillmentGroupItems(fulfillmentGroup)}
// //                   </Grid>
// //                 </Grid>
// //                 <Hidden only={["xs", "sm"]}>
// //                   <Grid className={classes.gridItemWithDivider} item xs={2}>
// //                     <div className={classes.verticalDivider}>&nbsp;</div>
// //                   </Grid>
// //                 </Hidden>
// //                 <Hidden only={["md", "lg", "xl"]}>
// //                   <Grid item xs={12}>
// //                     <Divider />
// //                   </Grid>
// //                 </Hidden>
// //                 <Grid className={classes.gridItemNeedingDivider} item xs={12} md={5}>
// //                   <Grid container spacing={32}>
// //                     <Grid item xs={12} md={12}>
// //                       <Typography paragraph variant="h4">
// //                         Shipping address
// //                       </Typography>
// //                       <Address address={shippingAddress} />
// //                     </Grid>
// //                     <Grid item xs={12} md={12}>
// //                       <Typography paragraph variant="h4">
// //                       Shipping method
// //                       </Typography>
// //                       <Typography
// //                         key={fulfillmentGroup._id}
// //                         variant="body1"
// //                       >
// //                         {fulfillmentGroup.selectedFulfillmentOption.fulfillmentMethod.carrier} - {fulfillmentGroup.selectedFulfillmentOption.fulfillmentMethod.displayName} {/* eslint-disable-line */}
// //                       </Typography>
// //                     </Grid>
// //                     <Grid item xs={12} md={12}>
// //                       <Typography paragraph variant="h4">
// //                       Tracking number
// //                       </Typography>
// //                       <OrderCardFulfillmentGroupTrackingNumber orderId={order._id} fulfillmentGroup={fulfillmentGroup} {...this.props}/>
// //                     </Grid>
// //                   </Grid>
// //                 </Grid>
// //               </Grid>
// //             </CardContent>
// //           </Card>
// //         </Grid>
// //       );
// //     });
// //   }

// //   render() {
// //     return (
// //       <Grid container spacing={32}>
// //         {this.renderFulfillmentGroups()}
// //       </Grid>
// //     );
// //   }
// // }

// // export default withStyles(styles, { name: "RuiOrderCardFulfillmentGroups" })(OrderCardFulfillmentGroups);
