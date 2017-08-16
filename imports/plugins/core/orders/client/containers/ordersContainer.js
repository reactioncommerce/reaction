import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import { Tracker } from "meteor/tracker";
import { Counts } from "meteor/tmeasday:publish-counts";
import { Reaction } from "/client/api";
import { Orders, Shops } from "/lib/collections";
import OrdersListContainer from "./ordersListContainer";
import {
  PACKAGE_NAME,
  ORDER_LIST_FILTERS_PREFERENCE_NAME,
  ORDER_LIST_SELECTED_ORDER_PREFERENCE_NAME,
  DEFAULT_FILTER_NAME
  // orderFilters
} from "../../lib/constants";

const OrderHelper =  {
  makeQuery(filter) {
    let query = {};

    switch (filter) {
      // Orders that have been approved
      case "approved":
        query = {
          "workflow.status": "coreOrderWorkflow/processing",
          "billing[0].paymentMethod.status": "approved"
        };
        break;

      // Orders that have been captured
      case "captured":
        query = {
          "billing[0].paymentMethod.status": "captured"
        };
        break;

      // Orders that are being processed
      case "processing":
        query = {
          "workflow.status": "coreOrderWorkflow/processing"
        };
        break;

      // Orders that are complete, including all items with complete status
      case "completed":
        query = {
          "workflow.status": {
            $in: ["coreOrderWorkflow/completed", "coreOrderWorkflow/canceled"]
          },
          "items.workflow.status": {
            $in: ["coreOrderItemWorkflow/completed", "coreOrderItemWorkflow/canceled"]
          }
        };
        break;

      case "canceled":
        query = {
          "workflow.status": "coreOrderWorkflow/canceled"
        };
        break;

      default:
    }

    return query;
  }
};

class OrdersContainer extends Component {
  constructor() {
    super();
    this.state = {
      orders: [],
      count: 0,
      limit: 10,
      currency: {},
      ready: false,
      bla: ""
    };

    this.hasMoreOrders = this.hasMoreOrders.bind(this);
    this.showMoreOrders = this.showMoreOrders.bind(this);
    this.dep = new Tracker.Dependency;
  }

  componentDidMount() {
    Tracker.autorun(() => {
      this.dep.depend();

      const filter = Reaction.getUserPreferences(PACKAGE_NAME, ORDER_LIST_FILTERS_PREFERENCE_NAME, DEFAULT_FILTER_NAME);
      console.log("filter in autorun", filter);

      const query = OrderHelper.makeQuery(filter);
      console.log("query", query);
      this.subscription = Meteor.subscribe("CustomPaginatedOrders");

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

  handleMenuClick = (event, value, bla) => {
    console.log("Heeere", value, bla);
    // console.log("message", bla, this.state.orders);
    // const orders = this.state.orders;
    // const listToShow = orders.filter(order => {
    //   return order.billing[0].paymentMethod.status === "approved";
    // });
    // const status = Reaction.Router.getQueryParam("status");
    // console.log("status", status);
    Reaction.setUserPreferences(PACKAGE_NAME, ORDER_LIST_FILTERS_PREFERENCE_NAME, "processing");
    Reaction.setUserPreferences(PACKAGE_NAME, ORDER_LIST_SELECTED_ORDER_PREFERENCE_NAME, null);
    this.setState({
      bla: bla
    }, () => {
      this.dep.changed();
    });
  }

  render() {
    if (this.state.ready) {
      return (
        <div>
          <OrdersListContainer
            orders={this.state.orders}
            ready={this.state.ready}
            hasMoreOrders={this.hasMoreOrders}
            handleShowMoreClick={this.showMoreOrders}
            handleMenuClick={this.handleMenuClick}
          />
        </div>

      );
    }
    return null;
  }
}

export default OrdersContainer;
