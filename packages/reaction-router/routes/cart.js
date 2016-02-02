cart = ReactionRouter.group({
  name: "cart",
  prefix: "/cart"
});

//
//  cart checkout
//
cart.route("/checkout", {
  name: "cartCheckout",
  action: function () {
    renderLayout({
      workflow: "coreCartWorkflow"
    });
  }
});

//
//  completed cart, order summary page
//
cart.route("/completed", {
  name: "cartCompleted",
  action: function () {
    renderLayout({
      workflow: "coreCartWorkflow",
      template: "cartCompleted"
    });
  }
});

cart.route("/completed/:_id", {
  action: function () {
    renderLayout({
      template: "cartCompleted",
      workflow: "coreCartWorkflow"
    });
  }
});
