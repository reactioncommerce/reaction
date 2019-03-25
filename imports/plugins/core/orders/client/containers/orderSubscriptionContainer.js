/* eslint-disable require-jsdoc */
import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import { Counts } from "meteor/tmeasday:publish-counts";
import { Orders } from "/lib/collections";
import { Components, composeWithTracker } from "@reactioncommerce/reaction-components";
import OrderDashboard from "../components/orderDashboard";

class OrderSubscription extends Component {
  render() {
    return (
      <OrderDashboard {...this.props} />
    );
  }
}

function composer(props, onData) {
  const { query, currentPage } = props;
  const options = { limit: props.pageSize, skip: props.skip };
  const ordersSubscription = Meteor.subscribe("PaginatedOrders", query, options);
  const totalOrderCount = Counts.get("orders-count");
  const pages = Math.ceil(totalOrderCount / props.pageSize);

  if (ordersSubscription.ready()) {
    const results = Orders.find(query).fetch();
    return onData(null, {
      orders: results,
      totalOrderCount,
      pages,
      currentPage
    });
  }
}

export default composeWithTracker(composer, Components.Loading)(OrderSubscription);
