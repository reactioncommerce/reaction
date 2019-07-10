import React, { Fragment } from "react";
import PropTypes from "prop-types";
import Helmet from "react-helmet";
import withStyles from "@material-ui/core/styles/withStyles";
import Grid from "@material-ui/core/Grid";
import { Blocks } from "@reactioncommerce/reaction-components";
import { i18next } from "/client/api";
import DetailDrawer from "/imports/client/ui/components/DetailDrawer";
import OrderAppBar from "./OrderAppBar";
import OrderCustomerDetails from "./OrderCustomerDetails";
import OrderCardFulfillmentGroups from "./OrderCardFulfillmentGroups";
import OrderHeader from "./OrderHeader";
import OrderPayments from "./OrderPayments";

const styles = (theme) => ({
  tabs: {
    marginBottom: theme.spacing.unit * 2
  }
});

/**
 * @name Order
 * @param {Object} props Component props
 * @returns {React.Component} returns a React component
 */
function Order(props) {
  const { order } = props;

  return (
    <Fragment>
      <Helmet title={`Order Details for order reference #${order.referenceId}`} />
      <OrderAppBar order={order} />
      <Grid container spacing={32}>
        <Grid item xs={12}>
          <OrderHeader order={order} />
        </Grid>
        <Grid container spacing={16}>
          <Grid item xs={12}>
            <OrderCardFulfillmentGroups order={order} />
          </Grid>
          <Grid item xs={12}>
            <OrderPayments order={order} />
          </Grid>
        </Grid>
      </Grid>
      <DetailDrawer title={i18next.t("orderCard.orderSummary.title", "Order summary")}>
        <Grid container spacing={8}>
          <Grid item xs={12}>
            <Blocks region="OrderCardSummary" blockProps={{ order, ...props }} />
          </Grid>
          <Grid item xs={12}>
            <OrderCustomerDetails order={order} />
          </Grid>
        </Grid>
      </DetailDrawer>
    </Fragment>
  );
}

Order.propTypes = {
  classes: PropTypes.object,
  order: PropTypes.object
};

export default withStyles(styles, { name: "RuiOrder" })(Order);
