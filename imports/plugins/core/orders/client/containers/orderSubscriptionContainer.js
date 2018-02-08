import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import { Orders, OrderSearch } from "/lib/collections";
import { Components, composeWithTracker } from "@reactioncommerce/reaction-components";
import OrderDashboard from "../components/orderDashboard";

class OrderSubscription extends Component {
  render() {
    return (
      <OrderDashboard {...this.props}/>
    );
  }
}

function composer(props, onData) {
  const subscription = Meteor.subscribe("SearchResults", "orders", props.searchQuery);
  let orderSearchResultsIds;
  const { query } = props;

  if (subscription.ready()) {
    const orderSearchResults = OrderSearch.find().fetch();
    orderSearchResultsIds = orderSearchResults.map((orderSearch) => orderSearch._id);
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

export default composeWithTracker(composer, Components.Loading)(OrderSubscription);
