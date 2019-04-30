import React, { Component } from "react";
import PropTypes from "prop-types";
import withStyles from "@material-ui/core/styles/withStyles";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
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
    order: PropTypes.object
  };

  renderHeader() {
    const { order } = this.props;

    return <OrderCardHeader order={order} />;
  }

  renderFulfillmentGroups() {
    const { order } = this.props;
    const { shipping } = order;

    return shipping.map((shipment) => <OrderCardFulfillmentGroup order={order} shipment={shipment} />);
  }

  renderSummary() {
    const { order } = this.props;

    return <OrderCardSummary order={order} />;
  }

  render() {
    const { classes } = this.props;

    return (
      <Grid container>
        <Grid item xs={12} md={12}>
          <section className={classes.orderCard}>
            <Typography variant="h5" gutterBottom>
              Order Details
            </Typography>
            {this.renderHeader()}
          </section>
          <section className={classes.orderCard}>
            <Typography variant="h5" gutterBottom>
              Shipments
            </Typography>
            {this.renderFulfillmentGroups()}
          </section>
          <section className={classes.orderCard}>
            <Typography variant="h5" gutterBottom>
              Summary
            </Typography>
            {this.renderSummary()}
          </section>
        </Grid>
      </Grid>
    );
  }
}

export default withStyles(styles, { name: "OrderCard" })(OrderCard);
