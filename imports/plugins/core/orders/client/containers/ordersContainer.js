import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import { Tracker } from "meteor/tracker";
import { Counts } from "meteor/tmeasday:publish-counts";
import { Orders, OrderSearch as OrderSearchCollection, Shops } from "/lib/collections";
import OrdersListContainer from "./ordersListContainer";
import OrderSearch from "../components/orderSearch";

class OrdersContainer extends Component {
  constructor() {
    super();
    this.state = {
      orders: [],
      count: 0,
      limit: 10,
      searchQuery: "",
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
      this.subscription = Meteor.subscribe("CustomPaginatedOrders");
      this.searchSub = Meteor.subscribe("SearchResults", "orders", this.state.searchQuery);

      if (this.searchSub.ready()) {
        const orderResults = OrderSearchCollection.find().fetch();
        console.log({ orderResults });
      }

      if (this.subscription.ready()) {
        const orders = Orders.find().fetch();
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

  handleSearchChange = (value) => {
    this.setState({ searchQuery: value }, () => {
      this.dep.changed();
    });
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
        <div className="orders-container">
          <OrderSearch handleChange={this.handleSearchChange} />
          <OrdersListContainer
            orders={this.state.orders}
            ready={this.state.ready}
            hasMoreOrders={this.hasMoreOrders}
            handleShowMoreClick={this.showMoreOrders}
          />
        </div>
      );
    }
    return null;
  }
}

export default OrdersContainer;
