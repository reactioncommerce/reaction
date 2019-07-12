import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import Helmet from "react-helmet";
import Grid from "@material-ui/core/Grid";
import { i18next } from "/client/api";
import DetailDrawer from "/imports/client/ui/components/DetailDrawer";
import OrderCardAppBar from "./orderCardAppBar";
import OrderCardFulfillmentGroup from "./orderCardFulfillmentGroup";
import OrderHeader from "./OrderHeader";
import OrderPayments from "./OrderPayments";
import OrderCardCustomerDetails from "./OrderCardCustomerDetails";
import OrderCardSummary from "./orderCardSummary";


class OrderCard extends Component {
  static propTypes = {
    order: PropTypes.object
  };

  state = {}

  renderAppBar() {
    const { order } = this.props;

    return <OrderCardAppBar order={order} />;
  }

  renderHeader() {
    const { order } = this.props;

    return <OrderHeader order={order} />;
  }

  renderFulfillmentGroups() {
    const { order } = this.props;

    return <OrderCardFulfillmentGroup order={order} />;
  }

  renderPayments() {
    const { order } = this.props;

    return <OrderPayments order={order} />;
  }

  renderSidebar() {
    const { order } = this.props;

    return (
      <Grid container spacing={1}>
        <Grid item xs={12}>
          {this.renderSummary()}
        </Grid>
        <Grid item xs={12}>
          <OrderCardCustomerDetails order={order} />
        </Grid>
      </Grid>
    );
  }

  renderSummary() {
    const { order } = this.props;

    return <OrderCardSummary order={order} />;
  }

  render() {
    const { order } = this.props;

    return (
      <Fragment>
        <Helmet title={`Order Details for order reference #${order.referenceId}`} />
        {this.renderAppBar()}
        <Grid container spacing={3}>
          <Grid item xs={12}>
            {this.renderHeader()}
          </Grid>
          <Grid item xs={12}>
            {this.renderFulfillmentGroups()}
          </Grid>
          <Grid item xs={12}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={12}>
                {this.renderPayments()}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <DetailDrawer title={i18next.t("orderCard.orderSummary.title", "Order summary")}>
          {this.renderSidebar()}
        </DetailDrawer>
      </Fragment>
    );
  }
}

export default OrderCard;
