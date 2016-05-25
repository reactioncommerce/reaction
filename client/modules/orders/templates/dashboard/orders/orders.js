import i18next from "i18next";
import { Reaction } from "/client/modules/core";
import { ReactionRouter } from "/client/modules/router";
import { Orders } from "/lib/collections";

const orderFilters = [{
  name: "new",
  label: "New"
}, {
  name: "processing",
  label: "Processing"
}, {
  name: "completed",
  label: "Completed"
}];

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
        "workflow.status": "coreOrderWorkflow/completed",
        "items.workflow.workflow": {
          $in: ["coreOrderItemWorkflow/completed"]
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
        "workflow.status": "canceled"
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

function getOrders(filter) {
  const query = OrderHelper.makeQuery(filter);
  return Orders.find(query);
}

function getFiltersWithCounts() {
  return orderFilters.map((filter) => {
    filter.label = i18next.t(`order.filter.${filter.name}`, {defaultValue: filter.label});
    filter.i18nKeyLabel = `order.filter.${filter.name}`;
    filter.count = Orders.find(OrderHelper.makeQuery(filter.name)).count();

    if (ReactionRouter.getQueryParam("filter")) {
      filter.active = ReactionRouter.getQueryParam("filter") === filter.name;
    }

    return filter;
  });
}

Template.orders.onCreated(() => {
  Template.instance().autorun(() => {
    let isActionViewOpen = Reaction.isActionViewOpen();
    const queryParams = ReactionRouter.current().queryParams;

    if (isActionViewOpen === false) {
      ReactionRouter.go("orders", {}, queryParams);
    }
  });
});

/**
 * orders helpers
 */
Template.orders.helpers({
  orders() {
    Reaction.Subscriptions.Orders = Reaction.Subscriptions.Manager.subscribe("Orders");
    if (Reaction.Subscriptions.Orders.ready()) {
      const template = Template.instance();
      const queryParams = ReactionRouter.getQueryParam("filter");
      template.orders = getOrders(queryParams);
      return template.orders;
    }
  },
  currentFilterLabel() {
    let foundFilter = _.find(orderFilters, (filter) => {
      return filter.name === ReactionRouter.getQueryParam("filter");
    });

    if (foundFilter) {
      return foundFilter.label;
    }
  },
  activeClassname(orderId) {
    if (ReactionRouter.getQueryParam("_id") === orderId) {
      return "panel-info";
    }
    return "panel-default";
  }
});

Template.ordersListItem.helpers({
  activeClassname(orderId) {
    if (ReactionRouter.getQueryParam("_id") === orderId) {
      return "active";
    }
  },

  orderIsNew(order) {
    return order.workflow.status === "new";
  }
});

Template.ordersListItem.events({
  "click [data-event-action=selectOrder]": function (event) {
    event.preventDefault();
    const isActionViewOpen = Reaction.isActionViewOpen();
    // toggle detail views
    if (isActionViewOpen === false) {
      Reaction.showActionView({
        label: "Order Details",
        data: this,
        props: {
          size: "large"
        },
        template: "coreOrderWorkflow"
      });
    }
    ReactionRouter.setQueryParams({
      _id: this._id
    });
  },
  "click [data-event-action=startProcessingOrder]": function (event) {
    event.preventDefault();
    const isActionViewOpen = Reaction.isActionViewOpen();

    if (this.workflow.status === "new") {
      Meteor.call("workflow/pushOrderWorkflow", "coreOrderWorkflow", "processing", this);
    }
    // toggle detail views
    if (isActionViewOpen === false) {
      Reaction.showActionView({
        label: "Order Details",
        data: this,
        props: {
          size: "large"
        },
        template: "coreOrderWorkflow"
      });
    }
    ReactionRouter.setQueryParams({
      filter: "processing",
      _id: this._id
    });
  }
});

Template.orderListFilters.events({
  "click [role=tab]": (event) => {
    event.preventDefault();
    const filter = event.currentTarget.getAttribute("data-filter");
    const isActionViewOpen = Reaction.isActionViewOpen();
    if (isActionViewOpen === true) {
      Reaction.hideActionView();
    }
    ReactionRouter.setQueryParams({
      filter: filter,
      _id: null
    });
  }
});

Template.orderListFilters.helpers({
  filters() {
    return getFiltersWithCounts();
  },
  activeClassname(item) {
    if (item.active === true) {
      return "active";
    }
  }
});
