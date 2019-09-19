import React from "react";
import PropTypes from "prop-types";
import withStyles from "@material-ui/core/styles/withStyles";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { withMoment } from "@reactioncommerce/reaction-components";
import { i18next } from "/client/api";
import DetailDrawerButton from "/imports/client/ui/components/DetailDrawerButton";
import OrderStatusChip from "./OrderStatusChip";

const styles = (theme) => ({
  extraEmphasisText: {
    fontWeight: theme.typography.fontWeightSemiBold
  },
  openSidebarButton: {
    marginLeft: "auto"
  }
});

/**
 * @name OrderHeader
 * @param {Object} props Component props
 * @returns {React.Component} returns a React component
 */
function OrderHeader(props) {
  const { classes, moment, order } = props;
  const { createdAt, displayStatus, referenceId, status } = order;
  const orderDate = (moment && moment(createdAt).format("MMMM DD, YYYY h:mm A")) || createdAt.toLocaleString();
  const { payments } = order;
  const paymentStatuses = payments.map((payment) => payment.status);
  const uniqueStatuses = [...new Set(paymentStatuses)];

  let paymentStatusChip;
  // If there are multiple payment statuses, show Multiple statuses badge
  if (Array.isArray(uniqueStatuses) && uniqueStatuses.length > 1) {
    paymentStatusChip =
      <Grid item>
        <OrderStatusChip displayStatus={i18next.t("data.status.multipleStatuses", "Multiple statuses")} status="multiple" type="payment" />
      </Grid>
    ;
  } else {
    const [paymentStatus] = uniqueStatuses;
    // show badge only if paymentStatus !== created
    if (paymentStatus !== "created") {
      paymentStatusChip =
        <Grid item>
          <OrderStatusChip displayStatus={paymentStatus} status={paymentStatus} type="payment" />
        </Grid>
      ;
    }
  }

  return (
    <Grid container spacing={1}>
      <Grid item xs={12}>
        <Grid container alignItems="center" spacing={2}>
          <Grid item>
            <Typography variant="h3" className={classes.extraEmphasisText} display="inline">
              {i18next.t("order.order", "Order")} - {referenceId}
            </Typography>
          </Grid>
          <Grid item>
            <OrderStatusChip displayStatus={displayStatus} status={status} type="order" />
          </Grid>
          {paymentStatusChip}
          <Grid item>
            <Button
              href={`/operator/orders/print/${order.referenceId}`}
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
        <Typography variant="body1" display="inline">{i18next.t("order.placed", "Placed")} {orderDate}</Typography>
      </Grid>
    </Grid>
  );
}

OrderHeader.propTypes = {
  classes: PropTypes.object,
  moment: PropTypes.func,
  order: PropTypes.shape({
    createdAt: PropTypes.string,
    displayStatus: PropTypes.string,
    referenceId: PropTypes.string,
    status: PropTypes.string
  })
};

export default withMoment(withStyles(styles, { name: "RuiOrderHeader" })(OrderHeader));
