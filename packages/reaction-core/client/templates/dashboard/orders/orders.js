Template.orders.onCreated(() => {
  let template = Template.instance();
  let currentData = Template.currentData();

  template.orderDep = new Tracker.Dependency;

  function getOrder(orderId) {
    template.orderDep.depend();
    return ReactionCore.Collections.Orders.find({});
  }

  Tracker.autorun(() => {
    template.orders = getOrder();
  });
});

/**
 * orders helpers
 *
 */

Template.orders.helpers({

  orders() {
    return Template.instance().orders; //ReactionCore.Collections.Orders.find({});
  },

  activeClassname(orderId) {
    if (Router.current().params._id === orderId) {
      return "panel-info";
    }
    return "panel-default";
  },

  settings: function () {
    // ensure sub is up to date
    ReactionCore.Subscriptions.Orders = Meteor.subscribe("Orders");
    // return reactive-table setup
    return {
      collection: ReactionCore.Collections.Orders,
      rowsPerPage: 10,
      showFilter: false,
      showNavigation: true,
      fields: [
          { key: 'userId', label: 'User', tmpl: Template.orderDetail },
          { key: 'items', label: 'Items', tmpl: Template.ordersListItems},
          { key: 'workflow.status', label: 'Status', tmpl: Template.orderStatusDetail },
          { key: 'invoices', label: 'Summary', tmpl: Template.ordersListSummary}
      ]
    };
  },

  isOrder: function () {
    if (this._id) {
      return true;
    } else {
      return false;
    }
  }
});

Template.orders.events({
  'click .reactive-table tbody tr': function (event) {
    if (this.workflow.status === "new") {
      this.workflow.status = "coreOrderCreated";
      Meteor.call("workflow/pushOrderWorkflow", "coreOrderWorkflow", "coreOrderCreated", this._id);
    }

    ReactionCore.showActionView({
      label: "Order Details",
      data: this,
      template: "coreOrderWorkflow"
    });

  }
});

Template.orderViewButton.events({
  'click button': function (event) {
    if (this.workflow.status === "new") {
      this.workflow.status = "coreOrderCreated";
      Meteor.call("workflow/pushOrderWorkflow", "coreOrderWorkflow", "coreOrderCreated", this._id);
    }

    Router.go("dashboard/orders", {
      _id: this._id
    });

    // ReactionCore.showActionView({
    //   label: "Order Details",
    //   data: this,
    //   template: "coreOrderWorkflow"
    // });

  }
});
