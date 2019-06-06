import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import Helmet from "react-helmet";
import Grid from "@material-ui/core/Grid";
import { Blocks } from "@reactioncommerce/reaction-components";
import OrderCardAppBar from "./orderCardAppBar";
import OrderCardFulfillmentGroup from "./orderCardFulfillmentGroup";
import OrderCardHeader from "./orderCardHeader";
import OrderCardPayments from "./orderCardPayments";


class OrderCard extends Component {
  static propTypes = {
    order: PropTypes.object
  };

  state = {}

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

  render() {
    const { order } = this.props;

    return (
      <Fragment>
        <Helmet title={`Order Details for order reference #${order.referenceId}`} />
        {this.renderAppBar()}
        <Grid container spacing={24}>
          <Grid item xs={12}>
            {this.renderHeader()}
          </Grid>
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
        </Grid>
      </Fragment>
    );
  }
}

export default OrderCard;
