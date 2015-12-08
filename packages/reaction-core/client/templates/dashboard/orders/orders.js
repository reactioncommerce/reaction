
const orderFilters = [
  {name: "new", label: "New"},
  {name: "captured", label: "Payment Captured"},
  {name: "shipped", label: "Shipped"},
  {name: "completed", label: "Completed"},
  {name: "canceled", label: "Canceled"},
  {name: "refunded", label: "Refunded"}
];

const OrderHelper = {
  makeQuery(filter) {
    let query = {};

    switch (filter) {
    // New orders
    case "new":
      query = {
        "workflow.status": "new"
      };
      break;

    // Orders that have been captured, but not yet shipped
    case "captured":
      query = {
        "billing.paymentMethod.status": "completed",
        "shipping.shipped": false
      };
      break;

    // Orders that have been shipped
    case "shipped":
      query = {
        "shipping.shipped": true
      };
      break;

    // Orders that have been both captured & shipped, meaning it is complete
    case "completed":
      query = {
        "billing.paymentMethod.status": "completed",
        "shipping.shipped": true
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

function getOrders(queryParams) {
  const query = OrderHelper.makeQuery(queryParams.filter);
  return ReactionCore.Collections.Orders.find(query);
}

function getFiltersWithCounts() {
  return orderFilters.map((filter) => {
    const queryParams = Router.current().params.query;

    filter.label = i18n.t(`order.filter.${filter.name}`);
    filter.count = ReactionCore.Collections.Orders.find(OrderHelper.makeQuery(filter.name)).count();

    if (queryParams) {
      filter.active = queryParams.filter === filter.name;
    }

    return filter;
  });
}

/**
 * orders helpers
 */
Template.orders.helpers({

  orders() {
    const template = Template.instance();
    const queryParams = Router.current().params.query;
    template.orders = getOrders(queryParams);

    return template.orders;
  },

  activeClassname(orderId) {
    if (Router.current().params._id === orderId) {
      return "panel-info";
    }
    return "panel-default";
  }
});

Template.ordersListItem.helpers({
  activeClassname(orderId) {
    if (Router.current().params._id === orderId) {
      return "panel-info";
    }
    return "panel-default";
  }
});

Template.ordersListItem.events({
  "click [data-event-action=selectOrder]": function (event) {
    event.preventDefault();

    if (this.workflow.status === "new") {
      this.workflow.status = "coreOrderCreated";
      Meteor.call("workflow/pushOrderWorkflow", "coreOrderWorkflow", "coreOrderSummary", this._id);
    }

    Router.go("dashboard/orders", {
      _id: this._id
    }, {
      query: $.param(Router.current().params.query)
    });
  }
});

Template.orderListFilters.events({
  "click [role=tab]": (event) => {
    const filter = event.currentTarget.getAttribute("data-filter");
    Router.go("dashboard/orders", {
      // _id: this._id
    }, {
      query: `filter=${filter}`
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
