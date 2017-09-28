import React, { Component } from "react";

import { compose } from "recompose";
import { Meteor } from "meteor/meteor";
import { Media, Orders, OrderSearch as OrderSearchCollection } from "/lib/collections";
import { Components, registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import OrderDashboard from "../components/blah";

class Subscription extends Component {
  render() {
    return (
      <OrderDashboard {...this.props}/>
    );
  }
}

function composer(props, onData) {
  console.log("props", props);
  const subscription = Meteor.subscribe("SearchResults", "orders", props.searchQuery);
  let orderSearchResultsIds;
  let searchQuery;

  const ordersSubscription = Meteor.subscribe("CustomPaginatedOrders", props.query);


  if (ordersSubscription.ready() && subscription.ready()) {
    const orderSearchResults = OrderSearchCollection.find().fetch();
    orderSearchResultsIds = orderSearchResults.map(orderSearch => orderSearch._id);
    // checking to ensure search was made and search results are returned
    if (props.searchQuery && Array.isArray(orderSearchResultsIds)) {
      // add matching results from search to query passed to Sortable
      searchQuery._id = { $in: orderSearchResultsIds };
    }

    // optional transform of collection for grid results
    const results = Orders.find(props.query).fetch();
    console.log("results", results);

    onData(null, {
      orders: results
    });
  }
}

export default composeWithTracker(composer, Components.Loading)(Subscription);
