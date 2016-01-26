

//
// Reaction route layout defaults
// todo: set up from Registry Layout
//
Router = FlowRouter;
ReactionRouter = FlowRouter.group({});

const layout = {
  template: "products",
  layoutHeader: "layoutHeader",
  layoutFooter: "layoutFooter",
  loadingTemplate: "loading",
  notFoundTemplate: "notFound",
  unauthorized: "unauthorized",
  printLayout: "printLayout",
  dashboardControls: "dashboardControls"
};

FlowRouter.notFound = {
  action() {
    BlazeLayout.render("coreLayout", {
      template: "notFound"
    });
  }
};

//
// index / home route
//

ReactionRouter.route("/", {
  name: "index",
  subscriptions: function () {
    Meteor.subscribe("Products", Session.get("productScrollLimit"));
  },
  action: function () {
    BlazeLayout.render("coreLayout", layout);
  }
});

//
// tag grid
//

ReactionRouter.route("/product/tag/:_tag", {
  subscriptions: function () {
    Meteor.subscribe("Products", Session.get("productScrollLimit"));
  },
  action: function () {
    const productGridLayout = Object.assign(layout, {
      template: "products"
    });
    BlazeLayout.render("coreLayout", productGridLayout);
  }
});

//
//  product detail page
//

ReactionRouter.route("/product/:handle/:variant?", {
  subscriptions: function (params) {
    Meteor.subscribe("Product", params.handle);
  },
  action: function (params) {
    const variant = ReactionCore.currentProduct.get("variantId") || params.variant;
    ReactionCore.setProduct(params.handle, variant);
    const productLayout = Object.assign(layout, {
      template: "productDetail"
    });
    BlazeLayout.render("coreLayout", productLayout);
    // will default to published product
    // let product = selectedProduct() || ReactionCore.Collections.Products.findOne();
    //
    // if (typeof product !== "undefined") {
    //   if (!product.isVisible) {
    //     if (!ReactionCore.hasPermission("createProduct")) {
    //       BlazeLayout.render("coreLayout", {template: "unauthorized"});
    //     }
    //   } else {
    //     BlazeLayout.render("coreLayout", productLayout);
    //   }
    // } else {
    //   BlazeLayout.render("coreLayout", {template: "productNotFound"});
    // }
  }
});

//
//  cart checkout
//

ReactionRouter.route("/cart/checkout", {
  name: "cartCheckout",
  subscriptions: function () {
    Meteor.subscribe("Shipping");
    Meteor.subscribe("AccountOrders");
  },
  action: function () {
    const checkoutLayout = Object.assign(layout, {
      template: "cartCheckout",
      layoutHeader: "checkoutHeader"
    });
    BlazeLayout.render("coreLayout", checkoutLayout);
  }
});

//
//  completed cart, order summary page
//

ReactionRouter.route("/cart/completed", {
  name: "cartCompleted",
  subscriptions: function (params) {
    Meteor.subscribe("Orders");
    Meteor.subscribe("CompletedCartOrder", Meteor.userId(), params._id);
  },
  action: function () {
    const checkoutLayout = Object.assign(layout, {
      template: "cartCompleted"
    });
    BlazeLayout.render("coreLayout", checkoutLayout);
  }
});


ReactionRouter.route("/cart/completed/:_id", {
  subscriptions: function (params) {
    Meteor.subscribe("Orders");
    Meteor.subscribe("CompletedCartOrder", Meteor.userId(), params._id);
  },
  action: function () {
    const checkoutLayout = Object.assign(layout, {
      template: "cartCompleted"
    });
    BlazeLayout.render("coreLayout", checkoutLayout);
  }
});
