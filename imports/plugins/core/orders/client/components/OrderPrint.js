/* eslint-disable max-len */
import React, { Fragment } from "react";
import PropTypes from "prop-types";
import Helmet from "react-helmet";
import ChevronLeftIcon from "mdi-material-ui/ChevronLeft";
import { Button, Divider, Grid, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import Address from "@reactioncommerce/components/Address/v1";
import { i18next } from "/client/api";

const useStyles = makeStyles((theme) => ({
  "dividerSpacing": {
    marginTop: theme.spacing(4)
  },
  "extraEmphasisText": {
    fontWeight: theme.typography.fontWeightSemiBold
  },
  "gridContainer": {
    border: `solid 1px ${theme.palette.colors.black}`,
    marginBottom: theme.spacing(8),
    marginLeft: "auto",
    marginRight: "auto",
    maxWidth: "960px",
    width: "960px"
  },
  "iconButton": {
    marginRight: "10px"
  },
  "@media print": {
    "@global": {
      html: {
        visibility: "hidden"
      }
    },
    "gridContainer": {
      visibility: "visible",
      display: "block",
      position: "absolute",
      top: "0",
      left: "0"
    }
  }
}));

/**
 * @name OrderPrint
 * @param {Object} props Component props
 * @returns {React.Component} returns a React component
 */
function OrderPrint(props) {
  const { order } = props;
  const classes = useStyles();
  const { fulfillmentGroups } = order;
  const orderDate = new Date(order.createdAt).toLocaleDateString("en-US");

  return (
    <Fragment>
      <Helmet title={`Order #${order.referenceId} printable invoice`} />
      <Grid container spacing={10}>
        <Grid item xs={12}>
          <Grid container alignItems="center" direction="row" justify="space-between">
            <Grid item>
              <Button
                href={`/operator/orders/${order.referenceId}`}
              >
                <ChevronLeftIcon className={classes.iconButton} />
                Back
              </Button>
            </Grid>
            <Grid item>
              <Button
                color="primary"
                onClick={() => window.print()}
                size="large"
                variant="contained"
              >
                {i18next.t("admin.orderWorkflow.invoice.printInvoice")}
              </Button>
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12} id="printable" className={classes.gridContainer}>
          <Grid container spacing={5}>
            <Grid item xs={12}>
              <Grid container>
                <Grid item xs={12} md={6}>
                  <Typography variant="h1" paragraph>{order.shop.name}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h2" paragraph>Order Invoice</Typography>
                  <Typography variant="h4" display="inline">Order ID: </Typography><Typography variant="body1" display="inline">{order.referenceId}</Typography><br />
                  <Typography variant="h4" display="inline">Date: </Typography><Typography variant="body1" display="inline">{orderDate}</Typography>
                </Grid>
              </Grid>
              <Divider className={classes.dividerSpacing} />
            </Grid>

            <Grid item xs={12}>
              <Grid container>
                <Grid item xs={12} md={6}>
                  <Typography variant="h2" paragraph>Shipping address</Typography>
                  <Address address={fulfillmentGroups[0].data.shippingAddress} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h2" paragraph>Billing address</Typography>
                  <Address address={fulfillmentGroups[0].data.shippingAddress} />
                </Grid>
              </Grid>
              <Divider className={classes.dividerSpacing} />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h2" paragraph>Payments</Typography>
              <Grid container spacing={4}>
                {order.payments.map((payment, index) => {
                  const { amount, displayName, processor, transactionId } = payment;
                  return (
                    <Grid item xs={12} key={index}>
                      <Grid container>
                        <Grid item xs={6} md={6}>
                          <Typography variant="h4">
                            {displayName}
                          </Typography>
                          <Typography variant="body2">
                          Processor: {processor}
                          </Typography>
                          <Typography variant="body2">
                          Transaction ID: {transactionId}
                          </Typography>
                        </Grid>
                        <Grid item xs={6} md={6}>
                          <Typography variant="body1" align="right">
                            {amount.displayAmount}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Grid>
                  );
                })}
              </Grid>
              <Divider className={classes.dividerSpacing} />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h2" paragraph>Fulfillment</Typography>
              <Grid container spacing={6}>
                {fulfillmentGroups.map((fulfillmentGroup, index) => {
                  const currentGroupCount = index + 1;
                  return (
                    <Grid item xs={12} key={index}>
                      <Grid container alignItems="center">
                        <Grid item xs={12}>
                          <Typography variant="h3">
                            {i18next.t("order.fulfillmentGroupHeader", `Fulfillment group ${currentGroupCount} of ${fulfillmentGroups.length}`)}
                          </Typography>
                          <Typography variant="body2">
                            <span className={classes.extraEmphasisText}>Shipping method: </span>
                            {fulfillmentGroup.selectedFulfillmentOption.fulfillmentMethod.carrier} - {fulfillmentGroup.selectedFulfillmentOption.fulfillmentMethod.displayName}
                          </Typography>
                          <Typography variant="body2" paragraph>
                            <span className={classes.extraEmphasisText}>Tracking number: </span>
                            {fulfillmentGroup.trackingNumber || "Not available"}
                          </Typography>
                        </Grid>
                      </Grid>
                      <Grid container spacing={4}>
                        {fulfillmentGroup.items.nodes.map((item) => (
                          <Grid key={item._id} item xs={12}>
                            <Grid container>
                              <Grid item xs={6} md={6}>
                                <Grid item xs={12} md={12}>
                                  <Typography variant="h4">
                                    {item.title}
                                  </Typography>
                                  <Typography variant="body2">
                                    {item.productVendor}
                                  </Typography>
                                  <Typography variant="body2">
                                    {item.variantTitle}
                                  </Typography>
                                  <Typography variant="body2">
                                    Quantity: {item.quantity}
                                  </Typography>
                                </Grid>
                              </Grid>
                              <Grid item xs={6} md={6}>
                                <Grid item xs={12} md={12}>
                                  <Typography variant="body1" align="right">
                                    {item.price.displayAmount}
                                  </Typography>
                                  <Typography variant="body1" align="right">
                                    <span className={classes.extraEmphasisText}>Total({item.quantity}): </span>
                                    {item.subtotal.displayAmount}
                                  </Typography>
                                </Grid>
                              </Grid>
                            </Grid>
                          </Grid>
                        ))}
                      </Grid>
                    </Grid>
                  );
                })}
              </Grid>
              <Divider className={classes.dividerSpacing} />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h2" paragraph>Summary</Typography>
              <Grid container>
                <Grid item xs={6}>
                  {order.summary.itemTotal &&
                    <Typography variant="body1">
                      Items
                    </Typography>
                  }
                  {order.summary.fulfillmentTotal &&
                    <Typography variant="body1">
                      Shipping
                    </Typography>
                  }
                  {order.summary.taxTotal &&
                    <Typography variant="body1">
                      Tax
                    </Typography>
                  }
                  {order.summary.discountTotal &&
                    <Typography variant="body1">
                      Discounts
                    </Typography>
                  }
                  {order.summary.surchargeTotal &&
                    <Typography variant="body1">
                      Surcharges
                    </Typography>
                  }
                  {order.summary.total &&
                    <Typography variant="body1">
                      Total
                    </Typography>
                  }
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body1" align="right">
                    {order.summary.itemTotal && order.summary.itemTotal.displayAmount}
                  </Typography>
                  <Typography variant="body1" align="right">
                    {order.summary.fulfillmentTotal && order.summary.fulfillmentTotal.displayAmount}
                  </Typography>
                  <Typography variant="body1" align="right">
                    {order.summary.taxTotal && order.summary.taxTotal.displayAmount}
                  </Typography>
                  <Typography variant="body1" align="right">
                    {order.summary.discountTotal && order.summary.discountTotal.displayAmount}
                  </Typography>
                  <Typography variant="body1" align="right">
                    {order.summary.surchargeTotal && order.summary.surchargeTotal.displayAmount}
                  </Typography>
                  <Typography variant="body1" align="right">
                    {order.summary.total && order.summary.total.displayAmount}
                  </Typography>
                </Grid>
              </Grid>
              <Divider className={classes.dividerSpacing} />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="body2">Thank you for your order.</Typography>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Fragment>
  );
}

OrderPrint.propTypes = {
  classes: PropTypes.object,
  order: PropTypes.object
};

export default OrderPrint;
