import React, { Component } from "react";

import { compose } from "recompose";
import { Meteor } from "meteor/meteor";
import { Media, Orders, OrderSearch as OrderSearchCollection } from "/lib/collections";
import { Components, registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import OrderDashboard from "../components/blah";

class Subscription extends Component {
  render() {
    console.log("props in order", {...this.props});
    return (
      <OrderDashboard {...this.props}/>
    );
  }
}

function composer(props, onData) {
  const subscription = Meteor.subscribe("SearchResults", "orders", props.searchQuery);
  let orderSearchResultsIds;
  const query = props.query;

  if (subscription.ready()) {
    const orderSearchResults = OrderSearchCollection.find().fetch();
    orderSearchResultsIds = orderSearchResults.map(orderSearch => orderSearch._id);
    // checking to ensure search was made and search results are returned
    if (props.searchQuery && Array.isArray(orderSearchResultsIds)) {
      // add matching results from search to query passed to Sortable
      query._id = { $in: orderSearchResultsIds };
    } else {
      // being here means no search text is inputed or search was cleared, so reset any previous match
      delete query._id;
    }

    const ordersSubscription = Meteor.subscribe("CustomPaginatedOrders", query);

    if (ordersSubscription.ready()) {
      const results = Orders.find(query).fetch();
      return onData(null, {
        orders: results
      });
    }
  }
}

export default composeWithTracker(composer, Components.Loading)(Subscription);
