import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import { Tracker } from "meteor/tracker";
import { Orders } from "/lib/collections";
import OrdersListContainer from "./ordersListContainer";

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
      ready: false,
      filter: ""
    };
    this.dep = new Tracker.Dependency;
  }

  componentDidMount() {
    Tracker.autorun(() => {
      this.dep.depend();

      const filter = this.state.filter;

      const query = OrderHelper.makeQuery(filter);
      this.subscription = Meteor.subscribe("CustomPaginatedOrders");

      if (this.subscription.ready()) {
        const orders = Orders.find(query).fetch();
        this.setState({
          orders: orders,
          ready: true
        });
      }
    });
  }

  componentWillUnmount() {
    this.subscription.stop();
  }

  handleMenuClick = (event, value) => {
    this.setState({
      filter: value
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
            handleMenuClick={this.handleMenuClick}
          />
        </div>
      );
    }
    return null;
  }
}

export default OrdersContainer;
