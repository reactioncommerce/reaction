import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import Helmet from "react-helmet";
import withStyles from "@material-ui/core/styles/withStyles";
import Grid from "@material-ui/core/Grid";
import OrderCardFulfillmentGroup from "./orderCardFulfillmentGroup";
import OrderCardHeader from "./orderCardHeader";
import OrderCardSummary from "./orderCardSummary";


const styles = (theme) => ({
  orderCard: {
    marginTop: theme.spacing.unit * 2.5
  }
});

class OrderCard extends Component {
  static propTypes = {
    classes: PropTypes.object,
    onCancelOrder: PropTypes.func,
    order: PropTypes.object
  };

  renderHeader() {
    const { onCancelOrder, order } = this.props;

    return (
      <OrderCardHeader
        onCancelOrder={onCancelOrder}
        order={order}
      />
    );
  }

  renderFulfillmentGroups() {
    const { order } = this.props;

    return <OrderCardFulfillmentGroup order={order} />;
  }

  renderSummary() {
    const { order } = this.props;

    return <OrderCardSummary order={order} />;
  }

  render() {
    const { classes, order } = this.props;

    return (
      <Fragment>
        <Helmet title={`Order Details for order reference #${order.referenceId}`} />
        <Grid container>
          <Grid item xs={12} md={12}>
            <section className={classes.orderCard}>
              {this.renderHeader()}
            </section>
            <section className={classes.orderCard}>
              {this.renderFulfillmentGroups()}
            </section>
            <section className={classes.orderCard}>
              {this.renderSummary()}
            </section>
          </Grid>
        </Grid>
      </Fragment>
    );
  }
}

export default withStyles(styles, { name: "OrderCard" })(OrderCard);
