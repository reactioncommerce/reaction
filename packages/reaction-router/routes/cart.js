cart = ReactionRouter.group({
  name: "cart",
  prefix: "/cart"
});

//
//  cart checkout
//
cart.route("/checkout", {
  name: "checkout",
  action: function () {
    renderLayout({
      workflow: "coreCartWorkflow"
    });
  }
});

//
//  completed cart, order summary page
//
cart.route("/completed/:_id?", {
  name: "cartCompleted",
  action: function () {
    renderLayout({
      template: "cartCompleted",
      workflow: "coreCartWorkflow"
    });
  }
});
