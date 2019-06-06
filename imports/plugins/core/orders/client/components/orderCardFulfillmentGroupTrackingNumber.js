import React, { Component } from "react";
import PropTypes from "prop-types";
import Link from "@material-ui/core/Link";


class OrderCardFulfillmentGroupTrackingNumber extends Component {
  static propTypes = {
    classes: PropTypes.object,
    fulfillmentGroup: PropTypes.object,
    orderId: PropTypes.string
  };

  state = {
    trackingNumber: this.props.fulfillmentGroup.tracking
  }

  render() {
    const { trackingNumber } = this.state;

    return (
      <Link
        component="button"
        variant="body2"
      >
        {trackingNumber}
      </Link>
    );
  }
}

export default OrderCardFulfillmentGroupTrackingNumber;
