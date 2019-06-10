import React, { Component } from "react";
import PropTypes from "prop-types";
import withStyles from "@material-ui/core/styles/withStyles";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";


const styles = (theme) => ({
  fulfillmentGroupSpacing: {
    marginBottom: theme.spacing.unit * 3
  },
  itemTextBold: {
    fontWeight: theme.typography.fontWeightBold
  }
});

class OrderCardFulfillmentGroupItem extends Component {
  static propTypes = {
    classes: PropTypes.object,
    item: PropTypes.shape({
      price: PropTypes.shape({
        displayAmount: PropTypes.string.isRequired
      }).isRequired,
      productVendor: PropTypes.string,
      quantity: PropTypes.number.isRequired,
      subtotal: PropTypes.shape({
        displayAmount: PropTypes.string.isRequired
      }).isRequired,
      variantTitle: PropTypes.string.isRequired
    }).isRequired
  };


  render() {
    const { classes, item } = this.props;
    const { price, productVendor, quantity, subtotal, variantTitle } = item;

    return (
      <Grid container className={classes.fulfillmentGroupSpacing}>
        <Grid item xs={12} md={6}>
          <Grid item className={classes.orderCardSection} xs={12} md={12}>
            <Typography variant="body2" className={classes.itemTextBold}>
              {variantTitle}
            </Typography>
            <Typography variant="body2">
              {productVendor}
            </Typography>
            <Typography variant="body2">
              Quantity: {quantity}
            </Typography>
          </Grid>
        </Grid>
        <Grid item xs={12} md={6}>
          <Grid item xs={12} md={12}>
            <Typography variant="body2" align="right">
              {price.displayAmount}
            </Typography>
            <Typography variant="body2" align="right">
              &nbsp;
            </Typography>
            <Typography variant="body2" align="right">
              {subtotal.displayAmount}
            </Typography>
          </Grid>
        </Grid>
      </Grid>
    );
  }
}

export default withStyles(styles, { name: "OrderCardFulfillmentGroupItem" })(OrderCardFulfillmentGroupItem);
