cart = Router.group({
  name: "cart",
  prefix: "/cart"
});

//
//  cart checkout
//
cart.route("/checkout", {
  name: "cartCheckout",
  subscriptions: function () {
    Meteor.subscribe("Shipping");
    Meteor.subscribe("AccountOrders");
  },
  action: function () {
    renderLayout(this, "coreLayout", "coreCartWorkflow");
  }
});

//
//  completed cart, order summary page
//
cart.route("/completed", {
  name: "cartCompleted",
  subscriptions: function (params) {
    Meteor.subscribe("Orders");
    Meteor.subscribe("CompletedCartOrder", Meteor.userId(), params._id);
  },
  action: function () {
    renderLayout(this, "coreLayout", "coreCartWorkflow", {
      template: "cartCompleted"
    });
  }
});


cart.route("/completed/:_id", {
  subscriptions: function (params) {
    Meteor.subscribe("Orders");
    Meteor.subscribe("CompletedCartOrder", Meteor.userId(), params._id);
  },
  action: function () {
    renderLayout(this, "coreLayout", "coreCartWorkflow", {
      template: "cartCompleted"
    });
  }
});
