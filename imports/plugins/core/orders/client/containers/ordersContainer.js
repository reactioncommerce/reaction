import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import { Tracker } from "meteor/tracker";
import { Orders, Shops } from "/lib/collections";
import OrdersListContainer from "./ordersListContainer";

class OrdersContainer extends Component {

  constructor() {
    super();
    this.state = {
      orders: [],
      count: 0,
      limit: 10,
      currency: {},
      ready: false
    };

    this.hasMoreOrders = this.hasMoreOrders.bind(this);
    this.showMoreOrders = this.showMoreOrders.bind(this);
    this.dep = new Tracker.Dependency;
  }

  componentDidMount() {
    Tracker.autorun(() => {
      this.dep.depend();
      const limit = this.state.limit;
      this.subscription = Meteor.subscribe("PaginatedOrders", limit);

      if (this.subscription.ready()) {
        const orders = Orders.find({}, { limit: limit }).fetch();
        this.setState({
          orders: orders,
          count: Counts.get("order-count"),
          ready: true
        });
      }

      const shop = Shops.findOne({});

      // Update currency information, this is passed to child components containing
      // Numeric inputs
      this.setState({
        currency: shop.currencies[shop.currency]
      });
    });
  }

  componentWillUnmount() {
    this.subscription.stop();
  }

  hasMoreOrders = () => {
    return this.state.count > this.state.limit;
  }

  showMoreOrders = (event) => {
    event.preventDefault();
    let limit = this.state.limit;
    limit += 10;

    this.setState({
      limit: limit
    }, () => {
      this.dep.changed();
    });
  }

  render() {
    if (this.state.ready) {
      return (
        <OrdersListContainer
          orders={this.state.orders}
          ready={this.state.ready}
          hasMoreOrders={this.hasMoreOrders}
          handleShowMoreClick={this.showMoreOrders}
        />
      );
    }
    return null;
  }
}

export default OrdersContainer;
