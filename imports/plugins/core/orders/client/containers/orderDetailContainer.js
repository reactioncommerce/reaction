import React, { Component } from "react";
import Blaze from "meteor/gadicc:blaze-react-component";
import { withRouter } from "react-router-dom";
import { compose } from "recompose";
import { Meteor } from "meteor/meteor";
import { Orders } from "/lib/collections";
import { Components, composeWithTracker } from "@reactioncommerce/reaction-components";

class OrderDetailSubscription extends Component {
  render() {
    return (
      <Blaze template="coreOrderWorkflow" {...this.props} />
    );
  }
}

/**
 * @name orderDetailComposer
 * @summary adds subscriptions to the order detail view
 * @param  {Object} props - props from parent component
 * @param  {Function} onData - Function to call when data is ready
 * @returns {undefined}
 */
function orderDetailComposer(props, onData) {
  const orderId = props.match.params._id;
  const { ready } = Meteor.subscribe("OrderById", orderId);

  if (ready()) {
    const order = Orders.findOne({ _id: orderId });
    onData(null, {
      order
    });
  }
}

export default compose(
  withRouter,
  composeWithTracker(orderDetailComposer, Components.Loading)
)(OrderDetailSubscription);
