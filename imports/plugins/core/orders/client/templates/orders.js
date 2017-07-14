import _ from "lodash";
import { Template } from "meteor/templating";
import { ReactiveDict } from "meteor/reactive-dict";
import { Counts } from "meteor/tmeasday:publish-counts";
import { Reaction } from "/client/api";
import { Orders, Shops } from "/lib/collections";
import OrdersActionContainer from "../containers/ordersActionContainer";
import OrdersListContainer from "../containers/ordersListContainer";
import {
  PACKAGE_NAME,
  ORDER_LIST_FILTERS_PREFERENCE_NAME,
  ORDER_LIST_SELECTED_ORDER_PREFERENCE_NAME,
  DEFAULT_FILTER_NAME,
  orderFilters
} from "../../lib/constants";

const OrderHelper =  {
  makeQuery(filter) {
    let query = {};

    switch (filter) {
      // New orders
      case "new":
        query = {
          "workflow.status": "new"
        };
        break;

      // Orders that have yet to be captured & shipped
      case "processing":
        query = {
          "workflow.status": "coreOrderWorkflow/processing"
        };
        break;

      // Orders that have been shipped, based on if the items have been shipped
      case "shipped":
        query = {
          "items.workflow.status": "coreOrderItemWorkflow/shipped"
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

      // Orders that have been captured, but not yet shipped
      case "captured":
        query = {
          "billing.paymentMethod.status": "completed",
          "shipping.shipped": false
        };
        break;

      case "canceled":
        query = {
          "workflow.status": "coreOrderWorkflow/canceled"
        };
        break;

      // Orders that have been refunded partially or fully
      case "refunded":
        query = {
          "billing.paymentMethod.status": "captured",
          "shipping.shipped": true
        };
        break;
      default:
    }

    return query;
  }
};

Template.orders.onCreated(function () {
  this.state = new ReactiveDict();
  this.orderLimits = new ReactiveDict();
  this.state.setDefault({
    orders: []
  });
  this.orderLimits.setDefault({
    new: 10,
    processing: 10,
    completed: 10
  });
  this.state.set("count", 0);

  const filterName = this.data && this.data.filter && this.data.filter.name || "new";
  Reaction.setUserPreferences(PACKAGE_NAME, ORDER_LIST_FILTERS_PREFERENCE_NAME, filterName);

  this.autorun(() => {
    const filter = Reaction.getUserPreferences(PACKAGE_NAME, ORDER_LIST_FILTERS_PREFERENCE_NAME, DEFAULT_FILTER_NAME);
    const limit = this.orderLimits.get(filter);
    const query = OrderHelper.makeQuery(filter);
    this.subscription = this.subscribe("PaginatedOrders", filter, limit);

    if (this.subscription.ready()) {
      const orders = Orders.find(query, { limit: limit }).fetch();
      this.state.set("orders", orders);
    }
  });

  // Watch for updates to shop collection
  this.autorun(() => {
    const shop = Shops.findOne({});

    // Update currency information, this is passed to child components containing
    // Numeric inputs
    this.state.set("currency", shop.currencies[shop.currency]);
  });
});

/**
 * orders helpers
 */
Template.orders.helpers({
  orderSubscription() {
    return Template.instance().subscription.ready();
  },
  FilterComponent() {
    const orderFilter = Reaction.getUserPreferences(PACKAGE_NAME, ORDER_LIST_FILTERS_PREFERENCE_NAME, DEFAULT_FILTER_NAME);
    return {
      component: OrdersActionContainer,
      limit: Template.instance().orderLimits.get(orderFilter),
      onActionClick(filter) {
        Reaction.setUserPreferences(PACKAGE_NAME, ORDER_LIST_FILTERS_PREFERENCE_NAME, filter.name);
        Reaction.setUserPreferences(PACKAGE_NAME, ORDER_LIST_SELECTED_ORDER_PREFERENCE_NAME, null);
      }
    };
  },
  OrdersListComponent() {
    const orderFilter = Reaction.getUserPreferences(PACKAGE_NAME, ORDER_LIST_FILTERS_PREFERENCE_NAME, DEFAULT_FILTER_NAME);
    return {
      component: OrdersListContainer,
      limit: Template.instance().orderLimits.get(orderFilter),
      orders: Template.instance().state.get("orders") || false,
      onActionClick(filter) {
        Reaction.setUserPreferences(PACKAGE_NAME, ORDER_LIST_FILTERS_PREFERENCE_NAME, filter.name);
        Reaction.setUserPreferences(PACKAGE_NAME, ORDER_LIST_SELECTED_ORDER_PREFERENCE_NAME, null);
      }
    };
  },
  itemProps(order) {
    return {
      order,
      currencyFormat: Template.instance().state.get("currency")
    };
  },

  orders() {
    return Template.instance().state.get("orders") || false;
  },

  hasMoreOrders() {
    const filter = Reaction.getUserPreferences(PACKAGE_NAME, ORDER_LIST_FILTERS_PREFERENCE_NAME, DEFAULT_FILTER_NAME);
    const instance = Template.instance();

    if (filter === "new") {
      instance.state.set("count", Counts.get("newOrder-count"));
    } else if (filter === "processing") {
      instance.state.set("count", Counts.get("processingOrder-count"));
    } else if (filter === "completed") {
      instance.state.set("count", Counts.get("completedOrder-count"));
    }

    return instance.state.get("count") > instance.orderLimits.get(filter);
  },

  currentFilterLabel() {
    const foundFilter = _.find(orderFilters, (filter) => {
      return filter.name === Reaction.Router.getQueryParam("filter");
    });

    if (foundFilter) {
      return foundFilter.label;
    }

    return "";
  },
  activeClassname(orderId) {
    if (Reaction.Router.getQueryParam("_id") === orderId) {
      return "panel-info";
    }
    return "panel-default";
  }
});

/**
 * orders events
 */
Template.orders.events({
  "click .show-more-orders": function (event, instance) {
    event.preventDefault();
    const filter = Reaction.getUserPreferences(PACKAGE_NAME, ORDER_LIST_FILTERS_PREFERENCE_NAME, DEFAULT_FILTER_NAME);
    let limit = instance.orderLimits.get(filter);
    limit += 10;
    instance.orderLimits.set(filter, limit);
  }
});
