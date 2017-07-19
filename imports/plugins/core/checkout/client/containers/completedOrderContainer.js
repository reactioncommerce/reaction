import React, { Component } from "react";
import PropTypes from "prop-types";
import { Meteor } from "meteor/meteor";
import { Orders } from "/lib/collections";
import { composeWithTracker } from "/lib/api/compose";
import { Reaction } from "/client/api";

import CompletedOrder from "../components/completedOrder";

class CompletedOrderContainer extends Component {


  render() {
    return (
      <div>
        <CompletedOrder order={this.props.order} />
      </div>
    );
  }
}

function composer(props, onData) {
  const order = Orders.findOne({
    userId: Meteor.userId(),
    cartId: Reaction.Router.getQueryParam("_id")
  });

  onData(null, {
    order
  });
}

CompletedOrder.propTypes  = {
  order: PropTypes.object
};

export default composeWithTracker(composer)(CompletedOrderContainer);
