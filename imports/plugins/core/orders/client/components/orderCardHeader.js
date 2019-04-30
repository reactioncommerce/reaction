import React, { Component } from "react";
import PropTypes from "prop-types";
import withStyles from "@material-ui/core/styles/withStyles";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { withMoment } from "@reactioncommerce/reaction-components";
import { ClickToCopy } from "@reactioncommerce/reaction-ui";
import OrderCardStatusChip from "./orderCardStatusChip";


import Address from "@reactioncommerce/components/Address/v1";

const styles = (theme) => ({
  orderCardInfoTextBold: {
    fontWeight: theme.typography.fontWeightBold
  },
  orderCardDivider: {
    borderTop: `solid 1px ${theme.palette.colors.black10}`,
    marginTop: theme.spacing.unit * 2.5,
    paddingTop: theme.spacing.unit * 2.5
  },
  orderCardInfoSection: {
    marginBottom: theme.spacing.unit * 3
  },
  orderCardReferenceIdLink: {
    pointer: "cursor"
  },




  orderAddressText: {
    color: theme.palette.colors.black65,
    fontSize: "14px"
  },




  orderStatusNew: {
    backgroundColor: `${theme.palette.colors.reactionBlue300}`,
    color: "white",
    fontWeight: "800"
  },
  orderStatusCanceled: {
    backgroundColor: `${theme.palette.colors.red300}`,
    color: "white",
    fontWeight: "800"
  },
  orderStatusProcessing: {
    backgroundColor: `${theme.palette.colors.reactionBlue300}`,
    color: "white",
    fontWeight: "800"
  },
  orderStatusShipped: {
    backgroundColor: `${theme.palette.colors.reactionBlue}`,
    color: "white",
    fontWeight: "800"
  }
});


class OrderCardHeader extends Component {
  static propTypes = {
    classes: PropTypes.object,
    moment: PropTypes.func,
    order: PropTypes.shape({
      createdAt: PropTypes.string,
      email: PropTypes.string,
      payments: PropTypes.string, // TODO: EK - update this PropType
      referenceId: PropTypes.string, // TODO: EK - update this PropType
      shipping: PropTypes.string, // TODO: EK - update this PropType
      workflow: PropTypes.shape({
        status: PropTypes.string
      })
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
      return payments.map((payment) => <Typography variant="p">{payment.displayName} {payment.amount.displayAmount}</Typography>);
    }

    // If only one payment method, do not display amount
    return payments.map((payment) => <Typography variant="p">{payment.displayName}</Typography>);
  }

  renderOrderShipments() {
    const { order: { shipping } } = this.props;

    if (Array.isArray(shipping) && shipping.length) {
      return shipping.map((fulfillmentGroup) => <Typography variant="p">{fulfillmentGroup.shipmentMethod.carrier} - {fulfillmentGroup.shipmentMethod.label}</Typography>); // eslint-disable-line
    }

    return null;
  }

  render() {

    console.log(" ----- ----- ----- ----- ----- renderHeader() this.props", this.props);

    const { classes, moment, order } = this.props;
    const { createdAt, email, referenceId, payments, shipping, shipping: fulfillmentGroups, workflow: { status } } = order;
    const { shippingAddress } = shipping[0].address;
    const orderDate = (moment && moment(createdAt).format("MM/DD/YYYY")) || createdAt.toLocaleString();

    return (
      <Card>
        <CardContent>
          <Grid container alignItems="center">
            <Grid item xs={12} md={4}>
              <Typography variant="p" className={classes.orderCardInfoTextBold}>Order Status:</Typography>
              <OrderCardStatusChip status={status} />
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="p" className={classes.orderCardInfoTextBold}>Date:</Typography>
              <Typography variant="p">{orderDate}</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="p" className={classes.orderCardInfoTextBold}>Order ID:</Typography>
              <Typography variant="p" className={classes.orderCardReferenceIdLink}>
                <ClickToCopy
                  copyToClipboard={this.orderLink()}
                  displayText={referenceId}
                  i18nKeyTooltip="admin.orderWorkflow.summary.copyOrderLink"
                  tooltip="Copy Order Link"
                />
              </Typography>
            </Grid>
          </Grid>
          <section className={classes.orderCardDivider}>
            <Grid container>
              <Grid item xs={12} md={6}>
                <Grid item className={classes.orderCardInfoSection} xs={12} md={12}>
                  <Typography variant="p" className={classes.orderCardInfoTextBold}>
                    Payment Method{payments.length !== 1 ? "s" : null}:
                  </Typography>
                  {this.renderOrderPayments()}
                </Grid>
                <Grid item className={classes.orderCardInfoSection} xs={12} md={12}>
                  <Typography variant="p" className={classes.orderCardInfoTextBold}>
                    Shipping Method{fulfillmentGroups.length !== 1 ? "s" : null}:
                  </Typography>
                  {this.renderOrderShipments()}
                </Grid>
              </Grid>
              <Grid item xs={12} md={6}>
                <Grid item xs={12} md={12}>
                  <Typography variant="p" className={classes.orderCardInfoTextBold}>
                    Shipping Address:
                  </Typography>
                  {/* <Address address={shippingAddress} className={classes.orderAddressText} /> */}
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
