import React, { Component } from "react";
import PropTypes from "prop-types";
import withStyles from "@material-ui/core/styles/withStyles";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Address from "@reactioncommerce/components/Address/v1";
import OrderCardFulfillmentGroupItem from "./orderCardFulfillmentGroupItem";
import OrderCardFulfillmentGroupTrackingNumber from "./orderCardFulfillmentGroupTrackingNumber";
import OrderCardStatusChip from "./orderCardStatusChip";


const styles = (theme) => ({
  fulfillmentGroupSpacing: {
    marginBottom: theme.spacing(2)
  },
  fulfillmentGroupHeader: {
    marginBottom: theme.spacing(2)
  },
  leftIcon: {
    marginRight: theme.spacing()
  },
  orderCardInfoTextBold: {
    fontWeight: theme.typography.fontWeightBold
  }
});

class OrderCardFulfillmentGroups extends Component {
  static propTypes = {
    classes: PropTypes.object,
    order: PropTypes.shape({
      fulfillmentGroups: PropTypes.array
    })
  };

  state = {
    shouldRestock: true
  };

  renderFulfillmentGroupItems(fulfillmentGroup) {
    return fulfillmentGroup.items.nodes.map((item) => <OrderCardFulfillmentGroupItem key={item._id} item={item} />);
  }

  render() {
    const { classes, order } = this.props;
    const { fulfillmentGroups } = order;
    const totalGroupsCount = fulfillmentGroups.length;

    return fulfillmentGroups.map((fulfillmentGroup, index) => {
      const currentGroupCount = index + 1;
      const { data: { shippingAddress }, status } = fulfillmentGroup;

      return (
        <Card key={fulfillmentGroup._id} className={classes.fulfillmentGroupSpacing} elevation={0}>
          <CardContent>
            <Grid container alignItems="center" className={classes.fulfillmentGroupHeader}>
              <Grid item xs={12} md={6}>
                <Grid container alignItems="center" spacing={8}>
                  <Grid item>
                    <Typography variant="body2" inline={true}>
                      Fulfillment group {currentGroupCount} of {totalGroupsCount}
                    </Typography>
                  </Grid>
                  <Grid item>
                    <OrderCardStatusChip displayStatus={status} status={status} type="shipment" />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <Grid container spacing={3} className={classes.fulfillmentGroupHeader}>
              <Grid item xs={12} md={6}>
                {this.renderFulfillmentGroupItems(fulfillmentGroup)}
              </Grid>
              <Grid item xs={12} md={6}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={12}>
                    <Typography variant="body2" className={classes.orderCardInfoTextBold}>
                      Shipping address
                    </Typography>
                    <Address address={shippingAddress} />
                  </Grid>
                  <Grid item xs={12} md={12}>
                    <Typography variant="body2" className={classes.orderCardInfoTextBold}>
                    Shipping method
                    </Typography>
                    <Typography
                      key={fulfillmentGroup._id}
                      variant="body2"
                    >
                      {fulfillmentGroup.selectedFulfillmentOption.fulfillmentMethod.carrier} - {fulfillmentGroup.selectedFulfillmentOption.fulfillmentMethod.displayName} {/* eslint-disable-line */}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={12}>
                    <Typography variant="body2" className={classes.orderCardInfoTextBold}>
                    Tracking number
                    </Typography>
                    <OrderCardFulfillmentGroupTrackingNumber orderId={order._id} fulfillmentGroup={fulfillmentGroup} />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      );
    });
  }
}

export default withStyles(styles, { name: "OrderCardFulfillmentGroups" })(OrderCardFulfillmentGroups);
