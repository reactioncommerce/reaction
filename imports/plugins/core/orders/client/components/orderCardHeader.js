import React, { Component } from "react";
import PropTypes from "prop-types";
import Email from "mdi-material-ui/Email";
import Account from "mdi-material-ui/Account";
import Phone from "mdi-material-ui/Phone";
import withStyles from "@material-ui/core/styles/withStyles";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Address from "@reactioncommerce/components/Address/v1";
import { withMoment } from "@reactioncommerce/reaction-components";
import { ClickToCopy } from "@reactioncommerce/reaction-ui";
import OrderCardStatusChip from "./orderCardStatusChip";


const styles = (theme) => ({
  orderCardDetailsHeader: {
    background: theme.palette.colors.coolGrey
  },
  orderCardInfoTextBold: {
    fontWeight: theme.typography.fontWeightBold
  },
  orderCardDivider: {
    borderTop: `solid 1px ${theme.palette.colors.black10}`,
    marginTop: theme.spacing.unit * 2.5,
    paddingTop: theme.spacing.unit * 2.5
  },
  orderCardSection: {
    marginBottom: theme.spacing.unit * 3
  },
  orderCardReferenceIdLink: {
    pointer: "cursor"
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

  render() {
    const { classes, moment, order } = this.props;
    const { createdAt, displayStatus, email, fulfillmentGroups, payments, referenceId, status } = order;
    const { shippingAddress } = fulfillmentGroups[0].data;
    const orderDate = (moment && moment(createdAt).format("MM/DD/YYYY")) || createdAt.toLocaleString();

    return (
      <Card>
        <CardContent>
          <Grid container alignItems="center" justify="space-evenly">
            <Grid item xs={12} md={4}>
              <Typography variant="body2"><Account />{shippingAddress.fullName}</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2"><Email />{email}</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2"><Phone />{shippingAddress.phone}</Typography>
            </Grid>
          </Grid>
          <Grid container alignItems="center" className={classes.orderCardDivider}>
            <Grid item xs={12} md={4}>
              <OrderCardStatusChip displayStatus={displayStatus} status={status} />
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" className={classes.orderCardInfoTextBold}>Date:</Typography>
              <Typography variant="body2">{orderDate}</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" className={classes.orderCardInfoTextBold}>Order ID:</Typography>
              <ClickToCopy
                copyToClipboard={this.orderLink()}
                displayText={referenceId}
                i18nKeyTooltip="admin.orderWorkflow.summary.copyOrderLink"
                tooltip="Copy Order Link"
              />
            </Grid>
          </Grid>
          <section className={classes.orderCardDivider}>
            <Grid container>
              <Grid item xs={12} md={6}>
                <Grid item className={classes.orderCardSection} xs={12} md={12}>
                  <Typography variant="body2" className={classes.orderCardInfoTextBold}>
                    Payment Method{payments.length !== 1 ? "s" : null}:
                  </Typography>
                  {this.renderOrderPayments()}
                </Grid>
                <Grid item className={classes.orderCardSection} xs={12} md={12}>
                  <Typography variant="body2" className={classes.orderCardInfoTextBold}>
                    Shipping Method{fulfillmentGroups.length !== 1 ? "s" : null}:
                  </Typography>
                  {this.renderOrderShipments()}
                </Grid>
              </Grid>
              <Grid item xs={12} md={6}>
                <Grid item xs={12} md={12}>
                  <Typography variant="body2" className={classes.orderCardInfoTextBold}>
                    Shipping Address:
                  </Typography>
                  <Address address={shippingAddress} />
                </Grid>
              </Grid>
            </Grid>
          </section>
        </CardContent>
      </Card>
    );
  }
}

export default withMoment(withStyles(styles, { name: "OrderCardHeader" })(OrderCardHeader));
