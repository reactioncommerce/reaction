import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import Helmet from "react-helmet";
import withStyles from "@material-ui/core/styles/withStyles";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardHeader from "@material-ui/core/CardHeader";
import Divider from "@material-ui/core/Divider";
import Grid from "@material-ui/core/Grid";
import Tab from "@material-ui/core/Tab";
import Tabs from "@material-ui/core/Tabs";
import Typography from "@material-ui/core/Typography";
import { Blocks } from "@reactioncommerce/reaction-components";
import { i18next } from "/client/api";
import DetailDrawer from "/imports/client/ui/components/DetailDrawer";
import OrderCardAppBar from "./OrderCardAppBar";
import OrderCardCustomerDetails from "./OrderCardCustomerDetails";
import OrderCardFulfillmentGroups from "./OrderCardFulfillmentGroups";
import OrderCardHeader from "./OrderCardHeader";
import OrderCardPayments from "./orderCardPayments";
import OrderCardRefunds from "./OrderCardRefunds";


const styles = (theme) => ({
  tabs: {
    marginBottom: theme.spacing.unit * 2
  }
});

class OrderCard extends Component {
  static propTypes = {
    classes: PropTypes.object,
    order: PropTypes.object
  };

  state = {
    currentTab: 0
  }

  handleTabChange = (event, value) => {
    this.setState({ currentTab: value });
  };

  renderAppBar() {
    const { order } = this.props;

    return <OrderCardAppBar order={order} />;
  }

  renderHeader() {
    const { order } = this.props;

    return <OrderCardHeader order={order} />;
  }

  renderFulfillment() {
    const { currentTab } = this.state;

    if (currentTab === 0) {
      return (
        <Fragment>
          <Grid item xs={12}>
            {this.renderFulfillmentGroups()}
          </Grid>
          <Grid item xs={12}>
            {this.renderPayments()}
          </Grid>
        </Fragment>
      );
    }

    return null;
  }

  renderFulfillmentGroups() {
    const { order } = this.props;

    return <OrderCardFulfillmentGroups order={order} />;
  }

  renderPayments() {
    const { order } = this.props;

    return <OrderCardPayments order={order} />;
  }

  renderRefunds() {
    const { order } = this.props;
    const { currentTab } = this.state;

    if (currentTab === 1) {
      return (
        <Grid item xs={12}>
          <OrderCardRefunds order={order} />
        </Grid>
      );
    }

    return null;
  }

  renderSidebar() {
    const { order } = this.props;

    return (
      <Grid container spacing={8}>
        <Grid item xs={12}>
          <Blocks region="OrderCardSummary" blockProps={{ order, ...this.props }} />
        </Grid>
        <Grid item xs={12}>
          <OrderCardCustomerDetails order={order} />
        </Grid>
      </Grid>
    );
  }

  renderTabs() {
    const { currentTab } = this.state;

    return (
      <Fragment>
        <Tabs value={currentTab} onChange={this.handleTabChange}>
          <Tab label={i18next.t("fulfillment", "Fulfillment")} />
          <Tab label={i18next.t("refunds", "Refunds")} />
        </Tabs>
        <Divider />
      </Fragment>
    );
  }

  render() {
    const { classes, order } = this.props;
    const { currentTab } = this.state;

    return (
      <Fragment>
        <Helmet title={`Order Details for order reference #${order.referenceId}`} />
        {this.renderAppBar()}
        <Grid container spacing={32}>
          <Grid item xs={12}>
            {this.renderHeader()}
          </Grid>
          <Grid className={classes.tabs} item xs={12}>
            {this.renderTabs()}
          </Grid>
          {currentTab === 0 &&
            this.renderFulfillment()
          }
          {currentTab === 1 &&
            this.renderRefunds()
            // TODO: EK - finish refunds
          }
        </Grid>
        <DetailDrawer title={i18next.t("orderCard.orderSummary.title", "Order summary")}>
          {this.renderSidebar()}
        </DetailDrawer>
      </Fragment>
    );
  }
}

export default withStyles(styles, { name: "RuiOrderCard" })(OrderCard);
