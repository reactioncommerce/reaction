import React, { Component } from "react";
import PropTypes from "prop-types";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";


class OrderCardSummary extends Component {
  static propTypes = {
    order: PropTypes.shape({
    })
  };

  render() {
    return (
      <Card>
        <CardHeader
          title="Order Card Summary"
          subheader="Order Card Summary"
        />
        <CardContent>
          <Typography component="p">
            Order Card Summary
          </Typography>

        </CardContent>
      </Card>
    );
  }
}

export default OrderCardSummary;
