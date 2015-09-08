/**
 * ReactionCore
 * Global reaction shop permissions methods and shop initialization
 */

var isDebug, levels, _ref, _ref1;

_.extend(ReactionCore, {
  shopId: null,
  init: function() {
    var self;
    self = this;
    return Tracker.autorun(function() {
      var domain, shop, shopHandle;
      shopHandle = Meteor.subscribe("Shops");
      if (shopHandle.ready()) {
        domain = Meteor.absoluteUrl().split('/')[2].split(':')[0];
        shop = ReactionCore.Collections.Shops.findOne({
          domains: domain
        });
        self.shopId = shop._id;
        return self;
      }
    });
  },
  hasPermission: function(permissions, userId) {
    var shop, _i, _len, _ref;
    userId = userId || Meteor.userId();
    if (!_.isArray(permissions)) {
      permissions = [permissions];
      permissions.push("admin", "owner");
    }
    if (Roles.userIsInRole(userId, permissions, this.shopId)) {
      return true;
    } else if (Roles.userIsInRole(userId, permissions, Roles.GLOBAL_GROUP)) {
      return true;
    }
    _ref = this.getSellerShopId();
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      shop = _ref[_i];
      if (Roles.userIsInRole(userId, permissions, shop)) {
        return true;
      }
    }
    return false;
  },
  hasOwnerAccess: function() {
    var ownerPermissions;
    ownerPermissions = ['owner'];
    return this.hasPermission(ownerPermissions);
  },
  hasAdminAccess: function() {
    var adminPermissions;
    adminPermissions = ['owner', 'admin'];
    return this.hasPermission(adminPermissions);
  },
  hasDashboardAccess: function() {
    var dashboardPermissions;
    dashboardPermissions = ['owner', 'admin', 'dashboard'];
    return this.hasPermission(dashboardPermissions);
  },
  getShopId: function() {
    return this.shopId;
  },
  allowGuestCheckout: function() {
    var allowGuest, packageRegistry, _ref, _ref1;
    packageRegistry = ReactionCore.Collections.Packages.findOne({
      name: 'core',
      shopId: this.shopId
    });
    allowGuest = (packageRegistry != null ? (_ref = packageRegistry.settings) != null ? (_ref1 = _ref["public"]) != null ? _ref1.allowGuestCheckout : void 0 : void 0 : void 0) || true;
    return allowGuest;
  },
  getSellerShopId: function(client) {
    return Roles.getGroupsForUser(Meteor.userId(), 'admin');
  },

  showActionView: function(viewData) {
    Session.set('admin/showActionView', true);
    ReactionCore.setActionView(viewData);
  },

  isActionViewOpen: function() {
    return Session.equals('admin/showActionView', true);
  },

  setActionView: function (viewData) {

    if (viewData) {
      Session.set('admin/actionView', viewData);
    } else {

      var registryItem = ReactionCore.getRegistryForCurrentRoute("settings");

      if (registryItem) {
        ReactionCore.setActionView(registryItem);
      } else {
        ReactionCore.setActionView({
          template: "blankControls"
        });
      }
    }
  },

  getActionView: function () {
    return Session.get('admin/actionView');
  },

  hideActionView: function () {
    Session.set('admin/showActionView', false);
  },

  clearActionView: function () {
    Session.set('admin/actionView', undefined);
  },

  getCurrentTag: function() {
    var tag;

    if (Router.current().route.getName() === "/product/tag") {
      tag = Router.current().params._id;
    }

    return tag
  },

  getRegistryForCurrentRoute: function (provides) {

    var routeName = Router.current().route.getName();

    var reactionApp = ReactionCore.Collections.Packages.findOne({
      // "registry.provides": provides,
      "registry.route": routeName
    }, {
      'enabled': 1,
      'registry': 1,
      'name': 1,
      'route': 1
    });

    if (reactionApp) {
      var settingsData = _.find(reactionApp.registry, function (item) {
        return item.provides === provides && item.route === routeName;
      });

      return settingsData;
    }

    return null;
  }

});


/*
 * configure bunyan logging module for reaction client
 * See: https://github.com/trentm/node-bunyan#levels
 */

isDebug = typeof Meteor !== "undefined" && Meteor !== null ? (_ref = Meteor.settings) != null ? (_ref1 = _ref["public"]) != null ? _ref1.isDebug : void 0 : void 0 : void 0;

levels = ["FATAL", "ERROR", "WARN", "INFO", "DEBUG", "TRACE"];

if (typeof isDebug !== 'boolean' && typeof isDebug !== 'undefined') {
  isDebug = isDebug.toUpperCase();
}

if (!_.contains(levels, isDebug)) {
  isDebug = "INFO";
}

ReactionCore.Events = bunyan.createLogger({
  name: 'core-client'
});

ReactionCore.Events.level(isDebug);


/*
 * registerLoginHandler
 * method to create anonymous users
 */

Accounts.loginWithAnonymous = function(anonymous, callback) {
  Accounts.callLoginMethod({
    methodArguments: [{
      anonymous: true
    }],
    userCallback: callback
  });
};


/**
 *  Startup Reaction
 *  Init Reaction client
 */

Meteor.startup(function() {
  if ((typeof PackageRegistry !== "undefined" && PackageRegistry !== null)) {
    ReactionCore.Events.warn("Bravely warning you that PackageRegistry should not be exported to client.", PackageRegistry);
  }
  ReactionCore.init();
  return Deps.autorun(function() {
    if (ReactionCore.allowGuestCheckout() && !Meteor.userId()) {
      Accounts.loginWithAnonymous();
    }
  });
});
