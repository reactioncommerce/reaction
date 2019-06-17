import React, { Component } from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import { Mutation } from "react-apollo";
import withStyles from "@material-ui/core/styles/withStyles";
import AppBar from "@material-ui/core/AppBar";
import Button from "@material-ui/core/Button";
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { i18next } from "/client/api";
import ConfirmButton from "/imports/client/ui/components/ConfirmButton";
import cancelOrderItemMutation from "../graphql/mutations/cancelOrderItem";
import { approveOrderPayments, captureOrderPayments } from "../graphql";
import { approvePayment, getOrderRiskBadge } from "../helpers";
import { getOrderRiskStatus } from "../helpers/graphql";


const styles = (theme) => ({
  toolbarButton: {
    marginLeft: theme.spacing.unit
  },
  leftSidebarOpen: {
    ...theme.mixins.leadingPaddingWhenPrimaryDrawerIsOpen
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

  state = {
    shouldRestock: true
  }

  handleApprovePayment = async (order, paymentIds) => {

    if (this.props.hasEditPermission) { // TODO: EK - update to better permission handling
      if (!order.payments) return Promise.resolve(null);

      // If paymentIds are not provided, capture all payments
      const paymentIdList = paymentIds || order.payments.map((payment) => payment._id);

      return approveOrderPayments({ orderId: order._id, paymentIds: paymentIdList, shopId: order.shop._id });
    }

    return null;
  }

  handleCancelOrder = (mutation) => {
    if (this.props.hasEditPermission) { // TODO: EK - update to better permission handling
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

  handleCapturePayment = async (order, paymentIds) => {
    if (this.props.hasEditPermission) { // TODO: EK - update to better permission handling
      // TODO: EK - handle capturing payment

      if (!order.payments) return Promise.resolve(null);

      // If paymentIds are not provided, capture all payments
      const paymentIdList = paymentIds || order.payments.map((payment) => payment._id);

      const approve = (paymentIdsNew) => {
        // foeach paymentId, approve payment
        return paymentIdsNew.map((paymentId) => {
          console.log("paymentId", paymentId);

          // get non opaque ID for each payment
          return approvePayment(order._id, paymentId);
        });
      };

      const capture = () => captureOrderPayments({ orderId: order._id, paymentIds: paymentIdList, shopId: order.shop._id });

      /**
       * @summary Show alert
       * @returns {Promise<Boolean>} Resolves if they click Continue
       */
      function alertDialog() {
        let alertType = "warning";
        const riskBadge = getOrderRiskBadge(getOrderRiskStatus(order));
        // use red alert color for high risk level
        if (riskBadge === "danger") {
          alertType = "error";
        }

        return Alerts.alert({
          title: i18next.t("admin.orderRisk.riskCapture"),
          text: i18next.t("admin.orderRisk.riskCaptureWarn"),
          type: alertType,
          showCancelButton: true,
          cancelButtonText: i18next.t("admin.settings.cancel"),
          confirmButtonText: i18next.t("admin.settings.continue")
        });
      }

      // before capturing, check if there's a payment risk on order; alert admin before capture
      if (getOrderRiskStatus(order)) {
        return alertDialog().then(approve(paymentIdList)).then(capture);
      }

      return approve(paymentIdList).then(capture);
    }

    return null;
  }

  handleInventoryRestockCheckbox = (name) => (event) => {
    if (this.props.hasEditPermission) { // TODO: EK - update to better permission handling
      this.setState({
        ...this.state,
        [name]: event.target.checked
      });
    }
  };

  handleInventoryRestock = (item) => {
    // TODO: EK - handle inventory restock
    if (this.props.hasEditPermission) { // TODO: EK - update to better permission handling
    }

    return null;
  }

  renderCancelOrderButton = () => {
    const { order } = this.props;
    const { shouldRestock } = this.state;
    const canCancelOrder = (order.status !== "coreOrderWorkflow/canceled");

    if (this.props.hasEditPermission) { // TODO: EK - update to better permission handling
      if (canCancelOrder) {
        return (
          <Mutation mutation={cancelOrderItemMutation}>
            {(mutationFunc) => (
              <ConfirmButton
                buttonColor="danger"
                buttonText={i18next.t("order.cancelOrderLabel", "Cancel order")}
                buttonVariant="outlined"
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

  renderCapturePaymentButton = () => {
    const { classes, order } = this.props;
    const canCapturePayment = order.payments.every((payment) => payment.mode !== "captured");

    if (this.props.hasEditPermission) { // TODO: EK - update to better permission handling
      if (canCapturePayment) {
        return (
          <Button
            className={classes.toolbarButton}
            color="primary"
            variant="contained"
            onClick={() => this.handleCapturePayment(order)}
          >
            {i18next.t("order.capturePayment", "Capture payment")}
          </Button>
        );
      }
    }

    return null;
  }

  renderApprovePaymentButton = () => {
    const { classes, order } = this.props;
    const canApprovePayment = order.payments.every((payment) => payment.mode === "created");

    if (this.props.hasEditPermission) { // TODO: EK - update to better permission handling
      if (canApprovePayment) {
        return (
          <Button
            className={classes.toolbarButton}
            color="primary"
            variant="contained"
            onClick={() => this.handleApprovePayment(order)}
          >
            Approve them all
          </Button>
        );
      }
    }

    return null;
  }

  render() {
    const { classes } = this.props;

    const uiState = {
      isLeftDrawerOpen: false
    };

    const toolbarClassName = classnames({
      [classes.leftSidebarOpen]: uiState.isLeftDrawerOpen
    });

    return (
      <AppBar color="default">
        <Toolbar className={toolbarClassName}>
          <Typography className={classes.title} variant="h6">{i18next.t("order.cancelOrderLabel", "Order details")}</Typography>
          {this.renderCancelOrderButton()}
          {this.renderCapturePaymentButton()}
          {this.renderApprovePaymentButton()}
        </Toolbar>
      </AppBar>
    );
  }
}

export default withStyles(styles, { name: "MuiOrderCardAppBar" })(OrderCardAppBar);
