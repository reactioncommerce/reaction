import React, { Component } from "react";
import PropTypes from "prop-types";
import withStyles from "@material-ui/core/styles/withStyles";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { withMoment } from "@reactioncommerce/reaction-components";
import { i18next, Reaction } from "/client/api";
import DetailDrawerButton from "/imports/client/ui/components/DetailDrawerButton";
import OrderCardStatusChip from "./orderCardStatusChip";

const styles = (theme) => ({
  fontWeightSemiBold: {
    fontWeight: theme.typography.fontWeightSemiBold
  },
  openSidebarButton: {
    marginLeft: "auto"
  }
});

class OrderHeader extends Component {
  static propTypes = {
    classes: PropTypes.object,
    moment: PropTypes.func,
    order: PropTypes.shape({
      createdAt: PropTypes.string,
      displayStatus: PropTypes.string,
      referenceId: PropTypes.string,
      status: PropTypes.string
    })
  };

  handleClickPrintLink() {
    const { order } = this.props;

    return Reaction.Router.pathFor("dashboard/pdf/orders", {
      hash: {
        id: order.referenceId
      }
    });
  }

  renderPaymentStatusChip() {
    const { order } = this.props;
    const { payments } = order;
    const paymentStatuses = payments.map((payment) => payment.status);
    const uniqueStatuses = [...new Set(paymentStatuses)];

    // If all payment statuses are equal, and also not "created", then show a single badge
    if (Array.isArray(uniqueStatuses) && uniqueStatuses.length === 1) {
      const [paymentStatus] = uniqueStatuses;

      // No action has been taken on any payments, no need to show a status badge
      // since we show the button to take action
      if (paymentStatus === "created") {
        return null;
      }

      // An action has been taken on payment, and all payment statuses are the same
      // show a single badge with the status of all payments
      return (
        <Grid item>
          <OrderCardStatusChip displayStatus={paymentStatus} status={paymentStatus} type="payment" />
        </Grid>
      );
    }

    // Payment statuses aren't equal, show an error badge here
    // and show badges next to payments to represent their status
    return (
      <Grid item>
        <OrderCardStatusChip displayStatus={i18next.t("data.status.multipleStatuses", "Multiple statuses")} status="multiple" type="payment" />
      </Grid>
    );
  }

  render() {
    const { classes, moment, order } = this.props;
    const { createdAt, displayStatus, referenceId, status } = order;
    const orderDate = (moment && moment(createdAt).format("MM/DD/YYYY")) || createdAt.toLocaleString();

    return (
      <Grid container spacing={8}>
        <Grid item xs={12}>
          <Grid container alignItems="center" spacing={16}>
            <Grid item>
              <Typography variant="h3" className={classes.fontWeightSemiBold} inline={true}>
                {i18next.t("order.order", "Order")} - {referenceId}
              </Typography>
            </Grid>
            <Grid item>
              <OrderCardStatusChip displayStatus={displayStatus} status={status} type="order" />
            </Grid>
            {this.renderPaymentStatusChip()}
            <Grid item>
              <Button
                href={this.handleClickPrintLink()}
                variant="text"
              >
                {i18next.t("admin.orderWorkflow.invoice.printInvoice", "Print invoice")}
              </Button>
            </Grid>
            <Grid className={classes.openSidebarButton} item>
              <DetailDrawerButton color="primary" size="small" variant="outlined">
                {i18next.t("orderCard.orderSummary.showOrderSummary", "Show order summary")}
              </DetailDrawerButton>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body1" inline={true}>{i18next.t("order.placed", "Placed")} {orderDate}</Typography>
        </Grid>
      </Grid>
    );
  }
}

export default withMoment(withStyles(styles, { name: "RuiOrderHeader" })(OrderHeader));
