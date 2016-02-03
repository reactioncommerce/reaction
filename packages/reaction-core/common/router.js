/*
 * Reaction Core Routing
 * reaction routing and security configuration
 * uses iron:router package.
 * Extend/override in reaction/client/routing.coffee
 */
Router.configure({
  notFoundTemplate: "notFound",
  loadingTemplate: "loading",

  onRun: function () {
    if (Meteor.isClient) {
      $(window).scrollTop(0);
      ReactionCore.hideActionView();
    }
    this.next();
  },

  onBeforeAction: function () {
    if (Meteor.isClient) {
      this.render("loading");
      Alerts.removeSeen();
      $(document).trigger("closeAllPopovers");
    }

    if (Meteor.isClient) {
      if (ReactionCore.hasDashboardAccess()) {
        this.layout("coreAdminLayout");
        // Find a registry entry for this page that provides settings
        // -- Settings is the default view for the "Action View"
        ReactionCore.setActionView();
        // this.render("dashboardPackages")
        $("body").addClass("admin");
      } else {
        $("body").removeClass("admin");
        this.layout("coreLayout");
      }
    }
    return this.next();
  }
});

Router.waitOn(function () {
  this.subscribe("Shops");
  return this.subscribe("Packages");
});

/*
 * ShopController Controller
 * main controller for the shop, most views except admin
 */
let ShopController = RouteController.extend({
  onAfterAction: function () {
    return ReactionCore.MetaData.refresh(this.route, this.params);
  },
  yieldTemplates: {
    layoutHeader: {
      to: "layoutHeader"
    },
    layoutFooter: {
      to: "layoutFooter"
    },
    dashboard: {
      to: "dashboard"
    }
  }
});

this.ShopController = ShopController;

/*
 * ShopAccountsController Controller
 * restricts access of accounts views
 */

let ShopAccountsController = RouteController.extend({
  onBeforeAction: function () {
    if (!ReactionCore.hasPermission(this.route.getName())) {
      this.render("layoutHeader", {
        to: "layoutHeader"
      });
      this.render("layoutFooter", {
        to: "layoutFooter"
      });
      this.render("unauthorized");
    } else {
      this.next();
    }
  },
  yieldTemplates: {
    layoutHeader: {
      to: "layoutHeader"
    },
    layoutFooter: {
      to: "layoutFooter"
    },
    dashboard: {
      to: "dashboard"
    }
  }
});

this.ShopAccountsController = ShopAccountsController;

/*
 * ShopAdminController Controller
 * restricts access of admin views
 */
let ShopAdminController = this.ShopController.extend({
  onBeforeAction: function () {
    if (!ReactionCore.hasPermission(this.route.getName())) {
      this.render("layoutHeader", {
        to: "layoutHeader"
      });
      this.render("layoutFooter", {
        to: "layoutFooter"
      });
      this.render("unauthorized");
    } else {
      this.next();
    }
  }
});

this.ShopAdminController = ShopAdminController;

/*
 * Print Controller
 */

let PrintController = RouteController.extend({
  onBeforeAction: function () {
    if (!ReactionCore.hasPermission(this.route.getName())) {
      this.render("unauthorized");
    } else {
      this.next();
    }
  }
});

this.PrintController = PrintController;

/*
 * General Route Declarations
 */

Router.map(function () {
  this.route("unauthorized", {
    template: "unauthorized",
    name: "unauthorized"
  });

  this.route("index", {
    controller: ShopController,
    path: "/",
    name: "index",
    template: "products",
    subscriptions: function () {
      Session.set("productFilters", {});
      Deps.autorun(function() {
        Meteor.subscribe("Products", Session.get("productScrollLimit"), Session.get("productFilters"));
      });
    }
  });

  this.route("dashboard", {
    controller: ShopAdminController,
    template: "dashboardPackages",
    onBeforeAction: function () {
      Session.set("dashboard", true);
      return this.next();
    }
  });

  this.route("dashboard/shop", {
    controller: ShopAdminController,
    path: "/dashboard/shop",
    template: "shopDashboard",
    data: function () {
      return ReactionCore.Collections.Shops.findOne();
    }
  });

  this.route('dashboard/import', {
    controller: ShopAdminController,
    path: '/dashboard/import',
    template: 'import'
  });

  this.route("dashboard/orders", {
    controller: ShopAdminController,
    path: "dashboard/orders/:_id?",
    template: "orders",
    onAfterAction: function () {


        if (ReactionCore.hasDashboardAccess() && this.params._id) {
          // this.layout("coreAdminLayout");
          // Find a registry entry for this page that provides settings
          // -- Settings is the default view for the "Action View"

          ReactionCore.showActionView({
            label: "Order Details",
            data: this.data(),
            props: {
              size: "large"
            },
            template: "coreOrderWorkflow"
          });

          // this.render("dashboardPackages")
          // $("body").addClass("admin");
        } else {
          // $("body").removeClass("admin");
          // this.layout("coreLayout");
        }

      // return this.next();
    },
    waitOn: function () {
      return this.subscribe("Orders");
    },
    data: function () {
      if (Orders.findOne(this.params._id)) {
        return ReactionCore.Collections.Orders.findOne({
          _id: this.params._id
        });
      }
    }
  });

  this.route("product/tag", {
    controller: ShopController,
    path: "product/tag/:_id",
    template: "products",
    subscriptions: function () {
      const id = this.params._id;
      const tag = ReactionCore.Collections.Tags.findOne(id) || ReactionCore.Collections.Tags.findOne({slug: id});
      Session.set("productFilters", {"tag": tag._id});
      Deps.autorun(function() {
        Meteor.subscribe("Products", Session.get("productScrollLimit"), Session.get("productFilters"));
      });
      Meteor.subscribe("Tags");
    }
  });

  this.route("product", {
    controller: ShopController,
    path: "product/:_id/:variant?",
    template: "productDetail",
    subscriptions: function () {
      return this.subscribe("Product", this.params._id);
    },
    onBeforeAction: function () {
      let variant;
      variant = currentProduct.get('variantId') || this.params.variant || this.params.query.variant;
      ReactionCore.setProduct(this.params._id, variant);
      return this.next();
    },
    data: function () {
      let product;
      product = selectedProduct();
      if (this.ready() && product) {
        if (!product.isVisible) {
          if (!ReactionCore.hasPermission("createProduct")) {
            this.render("unauthorized");
          }
        }
        return product;
      }
      if (this.ready() && !product) {
        return this.render("productNotFound");
      }
    }
  });

  this.route("cartCheckout", {
    layoutTemplate: "coreLayout",
    path: "checkout",
    template: "cartCheckout",
    yieldTemplates: {
      checkoutHeader: {
        to: "layoutHeader"
      }
    },
    waitOn: function () {
      this.subscribe("Packages");
      this.subscribe("Products");
      this.subscribe("Shipping");
      return this.subscribe("AccountOrders");
    }
  });

  this.route("cartCompleted", {
    controller: ShopController,
    path: "completed/:_id",
    template: "cartCompleted",
    subscriptions: function () {
      this.subscribe("Orders");
      return this.subscribe("CompletedCartOrder", Meteor.userId(),
        this.params._id);
    },
    data: function () {
      if (this.ready()) {
        if (ReactionCore.Collections.Orders.findOne({
          cartId: this.params._id
        })) {
          return ReactionCore.Collections.Orders.findOne({
            cartId: this.params._id
          });
        }
        return this.render("unauthorized");
      }
      return this.render("loading");
    }
  });

  this.route("dashboard/pdf/orders", {
    controller: PrintController,
    path: "dashboard/pdf/orders/:_id/",
    template: "completedPDFLayout",
    onBeforeAction() {
      this.layout("print");
      return this.next();
    },
    subscriptions: function () {
      this.subscribe("Orders");
    },
    data: function () {
      if (this.ready()) {
        let query = {
          _id: this.params._id
        };

        if (this.params.query.shipment) {
          query["shipping._id"] = this.params.query.shipment;
        }

        return ReactionCore.Collections.Orders.findOne(query);
      }
    }
  });
});
