import React, { Component } from "react";
import PropTypes from "prop-types";
import withStyles from "@material-ui/core/styles/withStyles";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";


const styles = (theme) => ({
  extraEmphasisText: {
    fontWeight: theme.typography.fontWeightSemiBold
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
    const { price, productVendor, quantity, subtotal, title, variantTitle } = item;

    return (
      <Grid container>
        <Grid item xs={6} md={6}>
          <Grid item xs={12} md={12}>
            <Typography paragraph variant="h4">
              {title}
            </Typography>
            <Typography variant="body2">
              {productVendor}
            </Typography>
            <Typography variant="body2">
              {variantTitle}
            </Typography>
            <Typography variant="body2">
              Quantity: {quantity}
            </Typography>
          </Grid>
        </Grid>
        <Grid item xs={6} md={6}>
          <Grid item xs={12} md={12}>
            <Typography paragraph variant="h4" align="right">
              {price.displayAmount}
            </Typography>
            <Typography variant="body1" align="right">
              Total({quantity}):&nbsp; <span className={classes.extraEmphasisText}>{subtotal.displayAmount}</span>
            </Typography>
          </Grid>
        </Grid>
      </Grid>
    );
  }
}

export default withStyles(styles, { name: "OrderCardFulfillmentGroupItem" })(OrderCardFulfillmentGroupItem);
