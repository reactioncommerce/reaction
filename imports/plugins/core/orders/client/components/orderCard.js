import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import Helmet from "react-helmet";
import Divider from "@material-ui/core/Divider";
import Grid from "@material-ui/core/Grid";
import Tab from "@material-ui/core/Tab";
import Tabs from "@material-ui/core/Tabs";
import { Blocks } from "@reactioncommerce/reaction-components";
import { i18next } from "/client/api";
import OrderCardAppBar from "./orderCardAppBar";
import OrderCardFulfillmentGroup from "./orderCardFulfillmentGroup";
import OrderCardHeader from "./orderCardHeader";
import OrderCardPayments from "./orderCardPayments";


class OrderCard extends Component {
  static propTypes = {
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

    return <OrderCardAppBar order={order} {...this.props} />;
  }

  renderHeader() {
    const { order } = this.props;

    return <OrderCardHeader order={order} {...this.props} />;
  }

  renderFulfillmentGroups() {
    const { order } = this.props;

    return <OrderCardFulfillmentGroup order={order} {...this.props} />;
  }

  renderPayments() {
    const { order } = this.props;

    return <OrderCardPayments order={order} {...this.props} />;
  }

  renderSummary() {
    const { order } = this.props;

    return <Blocks region="OrderCardSummary" blockProps={{ order, ...this.props }} />;
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

  renderFulfillment() {
    const { currentTab } = this.state;

    if (currentTab === 0) {
      return (
        <Fragment>
          <Grid item xs={12}>
            {this.renderFulfillmentGroups()}
          </Grid>
          <Grid item xs={12}>
            <Grid container spacing={24}>
              <Grid item xs={12} md={6}>
                {this.renderSummary()}
              </Grid>
              <Grid item xs={12} md={6}>
                {this.renderPayments()}
              </Grid>
            </Grid>
          </Grid>
        </Fragment>
      );
    }

    return null;
  }

  renderRefunds() {
    const { currentTab } = this.state;

    if (currentTab === 1) {
      return (
        <Fragment>
          <Grid item xs={12}>
            [Placeholder] Refunds will go here
          </Grid>
        </Fragment>
      );
    }

    return null;
  }

  render() {
    const { order } = this.props;
    const { currentTab } = this.state;

    return (
      <Fragment>
        <Helmet title={`Order Details for order reference #${order.referenceId}`} />
        {this.renderAppBar()}
        <Grid container spacing={24}>
          <Grid item xs={12}>
            {this.renderHeader()}
          </Grid>
          <Grid item xs={12}>
            {this.renderTabs()}
          </Grid>
          {currentTab === 0 &&
            this.renderFulfillment()
          }
          {currentTab === 1 &&
            this.renderRefunds()
          }
        </Grid>
      </Fragment>
    );
  }
}

export default OrderCard;
