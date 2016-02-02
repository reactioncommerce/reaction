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
  return ReactionCore.Collections.Orders.find(query);
}

function getFiltersWithCounts() {
  return orderFilters.map((filter) => {
    filter.label = i18n.t(`order.filter.${filter.name}`, {defaultValue: filter.label});
    filter.count = ReactionCore.Collections.Orders.find(OrderHelper.makeQuery(filter.name)).count();

    if (ReactionRouter.getQueryParam("filter")) {
      filter.active = ReactionRouter.getQueryParam("filter") === filter.name;
    }

    return filter;
  });
}

Template.orders.onCreated(() => {
  Template.instance().autorun(() => {
    let isActionViewOpen = ReactionCore.isActionViewOpen();
    const queryParams = ReactionRouter.current().queryParams;

    if (isActionViewOpen === false) {
      ReactionRouter.go("/dashboard/orders", {}, queryParams);
    }
  });
});

/**
 * orders helpers
 */
Template.orders.helpers({
  orders() {
    const template = Template.instance();
    const queryParams = ReactionRouter.getQueryParam("filter");
    template.orders = getOrders(queryParams);

    return template.orders;
  },
  currentFilterLabel() {
    let foundFilter = _.find(orderFilters, (filter) => {
      return filter.name === ReactionRouter.current().queryParams.filter;
    });

    if (foundFilter) {
      return foundFilter.label;
    }
  },
  activeClassname(orderId) {
    if (ReactionRouter.current().params._id === orderId) {
      return "panel-info";
    }
    return "panel-default";
  }
});

Template.ordersListItem.helpers({
  activeClassname(orderId) {
    if (ReactionRouter.current().params._id === orderId) {
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
    ReactionRouter.setQueryParams({
      _id: this._id
    });
  },
  "click [data-event-action=startProcessingOrder]": function (event) {
    event.preventDefault();

    if (this.workflow.status === "new") {
      Meteor.call("workflow/pushOrderWorkflow", "coreOrderWorkflow", "processing", this);
    }
    ReactionRouter.setQueryParams({
      _id: this._id,
      filter: "processing"
    });
  }
});

Template.orderListFilters.events({
  "click [role=tab]": (event) => {
    const filter = event.currentTarget.getAttribute("data-filter");
    ReactionRouter.setQueryParams({
      filter: filter
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
