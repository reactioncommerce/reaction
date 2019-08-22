/* eslint-disable max-len */
import React, { Fragment } from "react";
import PropTypes from "prop-types";
import Helmet from "react-helmet";
import ChevronLeftIcon from "mdi-material-ui/ChevronLeft";
import PrintIcon from "mdi-material-ui/Printer";
import withStyles from "@material-ui/core/styles/withStyles";
import Button from "@material-ui/core/Button";
import Divider from "@material-ui/core/Divider";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Address from "@reactioncommerce/components/Address/v1";
import { i18next, Reaction } from "/client/api";

const styles = (theme) => ({
  dividerSpacing: {
    marginTop: theme.spacing(4)
  },
  extraEmphasisText: {
    fontWeight: theme.typography.fontWeightSemiBold
  },
  fullWidthButton: {
    width: "100%"
  },
  gridContainer: {
    margin: "auto",
    maxWidth: "960px",
    width: "960px",
    border: "solid 1px #000000"
  },
  iconButton: {
    marginRight: "10px"
  }
});

/**
 * @name OrderPrint
 * @param {Object} props Component props
 * @returns {React.Component} returns a React component
 */
function OrderPrint(props) {
  const { classes, order } = props;
  const { fulfillmentGroups } = order;
  const orderDate = new Date(order.createdAt).toLocaleDateString("en-US");

  const printInvoice = () => {
    const printContents = document.getElementById("printable").innerHTML;
    const originalContents = document.body.innerHTML;
    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
  };

  return (
    <Fragment>
      <Helmet title={`Order #${order.referenceId} printable invoice`} />
      <Grid container spacing={10}>
        <Grid className={classes.nonPrintable} item xs={12}>
          <Grid container alignItems="center" direction="row" justify="space-between">
            <Grid item xs={4}>
              <Button
                onClick={() => Reaction.Router.go(`/operator/orders/${order.referenceId}`)}
              >
                <ChevronLeftIcon className={classes.iconButton} />
                Back
              </Button>
            </Grid>
            <Grid item xs={4}>
              <Button
                className={classes.fullWidthButton}
                color="primary"
                onClick={printInvoice}
                size="large"
                variant="contained"
              >
                <PrintIcon className={classes.iconButton} />
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

export default withStyles(styles, { name: "RuiOrder" })(OrderPrint);
