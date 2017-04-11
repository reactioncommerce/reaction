import React, { Component, PropTypes } from "react";
import moment from "moment";
import { composeWithTracker } from "/lib/api/compose";
import { i18next } from "/client/api";
import OrderSummary from "../components/orderSummary";

class OrderSummaryContainer extends Component {
  static propTypes = {
    order: PropTypes.object
  }

  constructor(props) {
    super(props);
    this.dateFormat = this.dateFormat.bind(this);
    this.tracking = this.tracking.bind(this);
  }

  dateFormat = (context, block) => {
    const f = block || "MMM DD, YYYY hh:mm:ss A";
    return moment(context).format(f);
  }

  tracking = () => {
    if (this.props.order.shipping[0].tracking) {
      return this.props.order.shipping[0].tracking;
    }
    return i18next.t("orderShipping.noTracking");
  }

  render() {
    return (
      <div>
        <OrderSummary
          {...this.props}
          dateFormat={this.dateFormat}
          tracking={this.tracking}
        />
      </div>
    );
  }
}

const composer = (props, onData) => {
  onData(null, {
    order: props.order
  });
};

export default composeWithTracker(composer, null)(OrderSummaryContainer);
