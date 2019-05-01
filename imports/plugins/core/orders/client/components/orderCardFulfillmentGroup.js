import React, { Component } from "react";
import PropTypes from "prop-types";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";


class OrderCardFulfillmentGroup extends Component {
  static propTypes = {
    order: PropTypes.shape({
    })
  };

  renderFulfillmentGroups() {
    const { order } = this.props;
    const { fulfillmentGroups } = order;

    return fulfillmentGroups.map((fulfillmentGroup) => (
      <Card elevation={0}>
        <CardHeader
          subheader={`Fulfillment group ${fulfillmentGroup._id}`}
        />
        <CardContent>
          <Typography>
          this is a fulfillment group
          </Typography>
        </CardContent>
      </Card>
    ));
  }

  render() {
    return (
      <Card>
        <CardHeader
          title="Fulfillment Groups"
        />
        <CardContent>
          {this.renderFulfillmentGroups()}
        </CardContent>
      </Card>
    );
  }
}

export default OrderCardFulfillmentGroup;
