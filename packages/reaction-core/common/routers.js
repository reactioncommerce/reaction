/**
* Reaction Core Routing
* @summary reaction routing and security configuration
* uses iron:router package.
*/

/**
* setProduct
* method to set default/parameterized product variant
*/
var PrintController, ShopAdminController, ShopController, setProduct;
setProduct = function(productId, variantId) {
  var product;
  if (!productId.match(/^[A-Za-z0-9]{17}$/)) {
    product = Products.findOne({
      handle: productId.toLowerCase()
    });
    productId = product != null ? product._id : void 0;
  }
  setCurrentProduct(productId);
  setCurrentVariant(variantId);
};


/**
* Router configure
* Global Route Configuration
*  Extend/override in reaction/client/routing.coffee
*/

Router.configure({
  notFoundTemplate: "notFound",
  loadingTemplate: "loading",
  onBeforeAction: function() {
    if (Meteor.isClient) {
      this.render("loading");
      Alerts.removeSeen();
      $(document).trigger('closeAllPopovers');
    }
    return this.next();
  }
});

Router.waitOn(function() {
  this.subscribe("Shops");
  return this.subscribe("Packages");
});

// ----------------------------------------------------------------------------

ShopController = RouteController.extend({
  onAfterAction: function() {
    return ReactionCore.MetaData.refresh(this.route, this.params);
  },
  layoutTemplate: "coreLayout",
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


// ----------------------------------------------------------------------------

ShopAdminController = this.ShopController.extend({
  onBeforeAction: function() {
    if (!ReactionCore.hasPermission(this.route.getName())) {
      this.render('layoutHeader', {
        to: 'layoutHeader'
      });
      this.render('layoutFooter', {
        to: 'layoutFooter'
      });
      this.render('unauthorized');
      this.done();
    } else {
      this.next();
    }
  }
});

this.ShopAdminController = ShopAdminController;


// ----------------------------------------------------------------------------


ShopSettingsController = this.ShopAdminController.extend({
  layoutTemplate: "coreSettingsLayout"
});

this.ShopSettingsController = ShopSettingsController;


// ----------------------------------------------------------------------------


PrintController = RouteController.extend({
  onBeforeAction: function() {
    if (!ReactionCore.hasPermission(this.route.getName())) {
      this.render('unauthorized');
    } else {
      this.next();
    }
  }
});

this.PrintController = PrintController;


// ----------------------------------------------------------------------------


/*
 * General Route Declarations
 */

Router.map(function() {

  this.route("unauthorized", {
    template: "unauthorized",
    name: "unauthorized"
  });


  this.route("index", {
    controller: ShopController,
    path: "/",
    name: "index",
    template: "products",
    waitOn: function() {
      return this.subscribe("Products");
    }
  });


  this.route('dashboard', {
    controller: ShopAdminController,
    template: 'dashboardPackages',
    onBeforeAction: function() {
      Session.set("dashboard", true);
      return this.next();
    }
  });


  this.route('dashboard/settings/shop', {
    controller: ShopSettingsController,
    path: '/dashboard/settings/shop',
    template: 'shopSettings',
    data: function() {
      return ReactionCore.Collections.Shops.findOne();
    }
  });


  this.route('dashboard/members', {
    controller: ShopAdminController,
    path: '/dashboard/members',
    template: 'coreAccounts'
  });


  this.route('dashboard/orders', {
    controller: ShopAdminController,
    path: 'dashboard/orders/:_id?',
    template: 'orders',
    data: function() {
      if (Orders.findOne(this.params._id)) {
        return ReactionCore.Collections.Orders.findOne({
          '_id': this.params._id
        });
      }
    }
  });


  this.route('product/tag', {
    controller: ShopController,
    path: 'product/tag/:_id',
    template: "products",
    waitOn: function() {
      return this.subscribe("Products");
    },
    subscriptions: function() {
      return this.subscribe("Tags");
    },
    data: function() {
      var id;
      if (this.ready()) {
        id = this.params._id;
        return {
          tag: Tags.findOne({
            slug: id
          }) || Tags.findOne(id)
        };
      }
    }
  });


  this.route('product', {
    controller: ShopController,
    path: 'product/:_id/:variant?',
    template: 'productDetail',
    subscriptions: function() {
      return this.subscribe('Product', this.params._id);
    },
    onBeforeAction: function() {
      var variant;
      variant = this.params.variant || this.params.query.variant;
      setProduct(this.params._id, variant);
      return this.next();
    },
    data: function() {
      var product;
      product = selectedProduct();
      if (this.ready() && product) {
        if (!product.isVisible) {
          if (!ReactionCore.hasPermission('createProduct')) {
            this.render('unauthorized');
          }
        }
        return product;
      }
      if (this.ready() && !product) {
        return this.render('productNotFound');
      }
    }
  });


  this.route('cartCheckout', {
    layoutTemplate: "coreLayout",
    path: 'checkout',
    template: 'cartCheckout',
    yieldTemplates: {
      checkoutHeader: {
        to: "layoutHeader"
      }
    },
    waitOn: function() {
      return this.subscribe("Packages");
    },
    subscriptions: function() {
      this.subscribe("Products");
      this.subscribe("Shipping");
      return this.subscribe("AccountOrders");
    }
  });


  this.route('cartCompleted', {
    controller: ShopController,
    path: 'completed/:_id',
    template: 'cartCompleted',
    subscriptions: function() {
      return this.subscribe("AccountOrders");
    },
    data: function() {
      if (this.ready()) {
        if (Orders.findOne(this.params._id)) {
          return ReactionCore.Collections.Orders.findOne({
            '_id': this.params._id
          });
        } else {
          return this.render('unauthorized');
        }
      } else {
        return this.render("loading");
      }
    }
  });


  return this.route('dashboard/pdf/orders', {
    controller: PrintController,
    path: 'dashboard/pdf/orders/:_id',
    template: 'completedPDFLayout',
    data: function() {
      if (Orders.findOne(this.params._id)) {
        return ReactionCore.Collections.Orders.findOne({
          '_id': this.params._id
        });
      }
    }
  });
});
