import React, { Component } from "react";
import PropTypes from "prop-types";
import withStyles from "@material-ui/core/styles/withStyles";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Address from "@reactioncommerce/components/Address/v1";
import { withMoment } from "@reactioncommerce/reaction-components";


const styles = (theme) => ({
  orderCardInfoTextSemiBold: {
    fontWeight: theme.typography.fontWeightSemiBold
  },
  orderCardInfoTextBold: {
    fontWeight: theme.typography.fontWeightBold
  },
  printButton: {
    flex: 1,
    justifyContent: "flex-end",
    display: "flex"
  }
});

class OrderCardCustomerDetails extends Component {
  static propTypes = {
    classes: PropTypes.object,
    moment: PropTypes.func,
    order: PropTypes.shape({
      createdAt: PropTypes.string,
      displayStatus: PropTypes.string,
      email: PropTypes.string,
      fulfillmentGroups: PropTypes.array,
      payments: PropTypes.array,
      referenceId: PropTypes.string,
      status: PropTypes.string
    })
  };

  render() {
    const { classes, order } = this.props;
    const { email, fulfillmentGroups } = order;
    const { shippingAddress } = fulfillmentGroups[0].data;

    return (
      <Grid container spacing={16}>
        <Grid item xs={12}>
          <Grid container spacing={24}>
            <Grid item xs={12} md={12}>
              <Card>
                <CardContent>
                  <Grid container spacing={24}>
                    <Grid item xs={12} md={12}>
                      <Typography variant="body2" className={classes.orderCardInfoTextSemiBold}>
                        Shipping address
                      </Typography>
                      <Address address={shippingAddress} />
                    </Grid>
                    <Grid item xs={12} md={12}>
                      <Typography variant="body2" className={classes.orderCardInfoTextBold}>
                        Contact information
                      </Typography>
                      <Typography variant="body2">{email}</Typography>
                      <Typography variant="body2">{shippingAddress.phone}</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    );
  }
}

export default withMoment(withStyles(styles, { name: "RuiOrderCardCustomerDetails" })(OrderCardCustomerDetails));
