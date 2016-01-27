cart = FlowRouter.group({
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
    let layout = Session.get("ReactionLayout");
    const checkoutLayout = Object.assign({}, layout, {
      template: "cartCheckout",
      layoutHeader: "checkoutHeader"
    });
    BlazeLayout.render("coreLayout", checkoutLayout);
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
    let layout = Session.get("ReactionLayout");
    const checkoutLayout = Object.assign({}, layout, {
      template: "cartCompleted"
    });
    BlazeLayout.render("coreLayout", checkoutLayout);
  }
});


cart.route("/completed/:_id", {
  subscriptions: function (params) {
    Meteor.subscribe("Orders");
    Meteor.subscribe("CompletedCartOrder", Meteor.userId(), params._id);
  },
  action: function () {
    let layout = Session.get("ReactionLayout");
    const checkoutLayout = Object.assign({}, layout, {
      template: "cartCompleted"
    });
    BlazeLayout.render("coreLayout", checkoutLayout);
  }
});
