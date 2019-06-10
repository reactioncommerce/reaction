import React, { Component } from "react";
import PropTypes from "prop-types";
import withStyles from "@material-ui/core/styles/withStyles";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Address from "@reactioncommerce/components/Address/v1";
import { withMoment } from "@reactioncommerce/reaction-components";
import { ClickToCopy } from "@reactioncommerce/reaction-ui";
import { i18next, Reaction } from "/client/api";
import OrderCardStatusChip from "./orderCardStatusChip";


const styles = (theme) => ({
  orderCardInfoTextBold: {
    fontWeight: theme.typography.fontWeightBold
  },
  printButton: {
    flex: 1,
    justifyContent: "flex-end",
    display: "flex"
  }
});

class OrderCardHeader extends Component {
  static propTypes = {
    classes: PropTypes.object,
    moment: PropTypes.func,
    order: PropTypes.shape({
      createdAt: PropTypes.string,
      displayStatus: PropTypes.string,
      email: PropTypes.string,
      fulfillmentGroups: PropTypes.array,
      payments: PropTypes.array,
      referenceId: PropTypes.string,
      status: PropTypes.string
    })
  };

  orderLink() {
    const { order: { referenceId } } = this.props;
    return `${window.location.origin}/operator/orders/${referenceId}`;
  }

  printLink() {
    const { order } = this.props;

    return Reaction.Router.pathFor("dashboard/pdf/orders", {
      hash: {
        id: order.referenceId
      }
    });
  }

  renderOrderPayments() {
    const { order: { payments } } = this.props;

    // If more than one payment method, display amount for each
    if (Array.isArray(payments) && payments.length > 1) {
      return payments.map((payment) => <Typography key={payment._id} variant="body2">{payment.displayName} {payment.amount.displayAmount}</Typography>);
    }

    // If only one payment method, do not display amount
    return payments.map((payment) => <Typography key={payment._id} variant="body2">{payment.displayName}</Typography>);
  }

  renderOrderShipments() {
    const { order: { fulfillmentGroups } } = this.props;

    if (Array.isArray(fulfillmentGroups) && fulfillmentGroups.length) {
      return fulfillmentGroups.map((fulfillmentGroup) => <Typography key={fulfillmentGroup._id} variant="body2">{fulfillmentGroup.selectedFulfillmentOption.fulfillmentMethod.carrier} - {fulfillmentGroup.selectedFulfillmentOption.fulfillmentMethod.displayName}</Typography>); // eslint-disable-line
    }

    return null;
  }

  renderPaymentStatusChip() {
    const { order } = this.props;
    const { payments } = order;
    const paymentStatuses = payments.map((payment) => payment.status);
    const uniqueStatuses = [...new Set(paymentStatuses)];

    // If all payment statuses are equal, and also not "new", then show a single badge
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
        <OrderCardStatusChip displayStatus="multiple" status="multiple" type="payment" />
      </Grid>
    );
  }

  render() {
    const { classes, moment, order } = this.props;
    const { createdAt, displayStatus, email, fulfillmentGroups, payments, referenceId, status } = order;
    const { shippingAddress } = fulfillmentGroups[0].data;
    const orderDate = (moment && moment(createdAt).format("MM/DD/YYYY")) || createdAt.toLocaleString();

    return (
      <Grid container spacing={32}>
        <Grid item xs={12}>
          <Grid container alignItems="center" spacing={8}>
            <Grid item>
              <Typography variant="body2" className={classes.orderCardInfoTextBold} inline={true}>
                Order&nbsp;
                <ClickToCopy
                  copyToClipboard={this.orderLink()}
                  displayText={referenceId}
                  i18nKeyTooltip="admin.orderWorkflow.summary.copyOrderLink"
                  tooltip="Copy Order Link"
                />
              </Typography>
              <Typography variant="body2" inline={true}> | {orderDate}</Typography>
            </Grid>
            <Grid item>
              <OrderCardStatusChip displayStatus={displayStatus} status={status} type="order" />
            </Grid>
            {this.renderPaymentStatusChip()}
            <Grid item className={classes.printButton}>
              <a href={this.printLink()} target="_blank">
                <Button size="small" variant="outlined">{i18next.t("admin.invoice.printInvoice", "Print invoice")}</Button>
              </a>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Grid container spacing={24}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Grid container spacing={24}>
                    <Grid item xs={12} md={12}>
                      <Typography variant="body2" className={classes.orderCardInfoTextBold}>
                        Shipping address
                      </Typography>
                      <Address address={shippingAddress} />
                    </Grid>
                    <Grid item xs={12} md={12}>
                      <Typography variant="body2" className={classes.orderCardInfoTextBold}>
                        Contact information
                      </Typography>
                      <Typography variant="body2">{email}</Typography>
                      <Typography variant="body2">{shippingAddress.phone}</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Grid container spacing={24}>
                    <Grid item xs={12} md={12}>
                      <Typography variant="body2" className={classes.orderCardInfoTextBold}>
                      Shipping method{fulfillmentGroups.length !== 1 ? "s" : null}
                      </Typography>
                      {this.renderOrderShipments()}
                    </Grid>
                    <Grid item xs={12} md={12}>
                      <Typography variant="body2" className={classes.orderCardInfoTextBold}>
                      Payment method{payments.length !== 1 ? "s" : null}
                      </Typography>
                      {this.renderOrderPayments()}
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    );
  }
}

export default withMoment(withStyles(styles, { name: "OrderCardHeader" })(OrderCardHeader));
