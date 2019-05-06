import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import Cancel from "mdi-material-ui/Cancel";
import Email from "mdi-material-ui/Email";
import Account from "mdi-material-ui/Account";
import Phone from "mdi-material-ui/Phone";
import { Mutation } from "react-apollo";
import withStyles from "@material-ui/core/styles/withStyles";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import CardHeader from "@material-ui/core/CardHeader";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Address from "@reactioncommerce/components/Address/v1";
import { withMoment } from "@reactioncommerce/reaction-components";
import { ClickToCopy } from "@reactioncommerce/reaction-ui";
import { i18next, Reaction } from "/client/api";
import cancelOrderItemMutation from "../graphql/mutations/cancelOrderItem";
import OrderCardStatusChip from "./orderCardStatusChip";

const styles = (theme) => ({
  orderCardTitleInfo: {
    borderTop: `solid 1px ${theme.palette.colors.black10}`,
    marginTop: theme.spacing.unit * 2.5,
    paddingTop: theme.spacing.unit * 2.5
  },


  displayFlexForIcon: {
    display: "flex"
  },
  leftIcon: {
    marginRight: theme.spacing.unit
  },
  paddingForIcon: {
    marginRight: theme.spacing.unit
  },
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

    const printOrder = Reaction.Router.pathFor("dashboard/pdf/orders", {
      hash: {
        id: order.referenceId
      }
    });

    return (
      <Fragment>
        <Grid item xs={12}>
          <Grid item xs={12} md={8}>
            <Typography variant="body2" className={classes.orderCardInfoTextBold} inline={true}>Order - {referenceId} | </Typography>
            <Typography variant="body2" inline={true}>{orderDate}</Typography>
            <OrderCardStatusChip displayStatus={displayStatus} status={status} />
            <OrderCardStatusChip displayStatus={displayStatus} status={status} />
          </Grid>
          <Grid item xs={12} md={4}>
            <a href={printOrder} target="_blank">
              <Button variant="outlined">Print invoice</Button>
            </a>
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
      </Fragment>
    );
  }
}

export default withMoment(withStyles(styles, { name: "OrderCardHeader" })(OrderCardHeader));
