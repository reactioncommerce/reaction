import React from "react";
import PropTypes from "prop-types";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardHeader from "@material-ui/core/CardHeader";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";

/**
 * @name OrderCustomerDetails
 * @param {Object} props Component props
 * @returns {React.Component} returns a React component
 */
function OrderCustomerDetails({ order }) {
  const { email, fulfillmentGroups } = order;
  const { shippingAddress: { fullName, phone } } = fulfillmentGroups[0].data;

  return (
    <Card>
      <CardHeader
        title="Customer information"
      />
      <CardContent>
        <Grid container spacing={3}>
          <Grid item xs={12} md={12}>
            <Typography variant="h4">
              {fullName}
            </Typography>
          </Grid>
          <Grid item xs={12} md={12}>
            <Typography variant="body1">{email}</Typography>
            <Typography variant="body1">{phone}</Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

OrderCustomerDetails.propTypes = {
  order: PropTypes.shape({
    email: PropTypes.string,
    fulfillmentGroups: PropTypes.arrayOf(PropTypes.shape({
      shippingAddress: PropTypes.shape({
        fullName: PropTypes.string,
        phone: PropTypes.string
      })
    }))
  })
};

export default OrderCustomerDetails;
