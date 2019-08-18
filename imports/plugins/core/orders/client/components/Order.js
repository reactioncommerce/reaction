import React, { Fragment, useState } from "react";
import PropTypes from "prop-types";
import Helmet from "react-helmet";
import withStyles from "@material-ui/core/styles/withStyles";
import Divider from "@material-ui/core/Divider";
import Grid from "@material-ui/core/Grid";
import Tab from "@material-ui/core/Tab";
import Tabs from "@material-ui/core/Tabs";
import { Blocks } from "@reactioncommerce/reaction-components";
import { i18next } from "/client/api";
import DetailDrawer from "/imports/client/ui/components/DetailDrawer";
import OrderAppBar from "./OrderAppBar";
import OrderCustomerDetails from "./OrderCustomerDetails";
import OrderCardFulfillmentGroups from "./OrderCardFulfillmentGroups";
import OrderHeader from "./OrderHeader";
import OrderPayments from "./OrderPayments";
import OrderRefunds from "./OrderRefunds";

const styles = (theme) => ({
  tabs: {
    marginBottom: theme.spacing(2)
  }
});

/**
 * @name Order
 * @param {Object} props Component props
 * @returns {React.Component} returns a React component
 */
function Order(props) {
  const { classes, order } = props;
  const [currentTab, setTab] = useState(0);

  const handleTabChange = (event, value) => {
    setTab(value);
  };

  return (
    <Fragment>
      <Helmet title={`Order Details for order reference #${order.referenceId}`} />
      <OrderAppBar order={order} />
      <Grid container spacing={4}>

        <Grid item xs={12}>
          <OrderHeader order={order} />
        </Grid>
        <Grid className={classes.tabs} item xs={12}>
          <Tabs value={currentTab} onChange={handleTabChange}>
            <Tab label={i18next.t("fulfillment", "Fulfillment")} />
            <Tab label={i18next.t("refunds", "Refunds")} />
          </Tabs>
          <Divider />
        </Grid>
        {currentTab === 0 &&
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <OrderCardFulfillmentGroups order={order} />
            </Grid>
            <Grid item xs={12}>
              <OrderPayments order={order} />
            </Grid>
          </Grid>
        }
        {currentTab === 1 &&
          <Grid item xs={12}>
            <OrderRefunds order={order} />
          </Grid>
        }
      </Grid>
      <DetailDrawer title={i18next.t("orderCard.orderSummary.title", "Order summary")}>
        <Grid container spacing={1}>
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
