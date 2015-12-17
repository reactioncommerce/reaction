/**
 * ReactionCore
 * Global reaction shop permissions methods and shop initialization
 */
_.extend(ReactionCore, {
  shopId: null,
  init: function () {
    let self;
    self = this;
    return Tracker.autorun(function () {
      let domain;
      let shop;
      let shopHandle;
      // keep an eye out for shop change
      shopHandle = Meteor.subscribe("Shops");
      if (shopHandle.ready()) {
        domain = Meteor.absoluteUrl().split("/")[2].split(":")[0];
        shop = ReactionCore.Collections.Shops.findOne({
          domains: domain
        });
        self.shopId = shop._id;

        // fix for https://github.com/reactioncommerce/reaction/issues/248
        // we need to keep an eye for rates changes
        const { Locale } = ReactionCore;
        if (typeof Locale.locale === "object" &&
          typeof Locale.currency === "object" &&
          typeof Locale.locale.currency === "string") {
          const localeCurrency = Locale.locale.currency.split(",")[0];
          if (typeof shop.currencies[localeCurrency] === "object" &&
            typeof shop.currencies[localeCurrency].rate === "number") {
            Locale.currency.rate = shop.currencies[localeCurrency].rate;
            localeDep.changed();
          }
        }
        // we are looking for a shopCurrency changes here
        if (typeof Locale.shopCurrency === "object") {
          Locale.shopCurrency = shop.currencies[shop.currency];
          localeDep.changed();
        }

        return self;
      }
    });
  },
  /**
   * hasPermission - client permissions checks
   * @param {String | Array} checkPermissions -String or Array of permissions if empty, defaults to "admin, owner"
   * @param {String} checkUserId - userId, defaults to Meteor.userId()
   * @param {String} group - default to shopId
   * @return {Boolean} Boolean - true if has permission
   */
  hasPermission: function (checkPermissions, checkUserId, group) {
    check(checkPermissions, Match.OneOf(String, Array));
    // use current user if userId if not provided
    let userId = checkUserId || this.userId || Meteor.userId();
    let shopId = group || this.getShopId();
    let permissions = [];

    // if we're checking permissions, we should have a userId!!
    // the assumption is that a null user doesn't have permissions
    // for something that with permissions
    if (!userId) {
      return false;
    }
    // permissions can be either a string or an array
    // we'll force it into an array so we can add
    // admin roles
    if (!_.isArray(checkPermissions)) {
      permissions = [checkPermissions];
    } else {
      permissions = checkPermissions;
    }
    // if the user has admin, owner permissions we'll always check if those roles are enough
    permissions.push("admin", "owner");
    // check if userIs the Roles
    if (Roles.userIsInRole(userId, permissions, shopId)) {
      return true;
    } else if (Roles.userIsInRole(userId,
        permissions,
        Roles.GLOBAL_GROUP
      )) {
      return true;
    }

    // global roles check
    let sellerShopPermissions = Roles.getGroupsForUser(userId, "admin");
    // we're looking for seller permissions.
    if (sellerShopPermissions) {
      // loop through shops roles and check permissions
      for (let key in sellerShopPermissions) {
        if (key) {
          let shop = sellerShopPermissions[key];
          if (Roles.userIsInRole(checkUserId, permissions, shop)) {
            return true;
          }
        }
      }
    }
    // no specific permissions found returning false
    return false;
  },
  hasOwnerAccess: function () {
    let ownerPermissions = ["owner"];
    return this.hasPermission(ownerPermissions);
  },
  hasAdminAccess: function () {
    let adminPermissions = ["owner", "admin"];
    return this.hasPermission(adminPermissions);
  },
  hasDashboardAccess: function () {
    let dashboardPermissions = ["owner", "admin", "dashboard"];
    return this.hasPermission(dashboardPermissions);
  },
  getShopId: function () {
    return this.shopId;
  },
  allowGuestCheckout: function () {
    let allowGuest = true;
    let packageRegistry = ReactionCore.Collections.Packages.findOne({
      name: "core",
      shopId: this.shopId
    });
    // we can disable in admin, let's check.
    if (typeof packageRegistry === "object" &&
      typeof packageRegistry.settings === "object" &&
      packageRegistry.settings.allowGuestCheckout) {
      allowGuest = packageRegistry.settings.allowGuestCheckout;
    }
    return allowGuest;
  },
  getSellerShopId: function () {
    return Roles.getGroupsForUser(this.userId, "admin");
  },

  /**
   * @description showActionView
   *
   * @param {String} viewData {label, template, data}
   * @returns {String} Session "admin/showActionView"
   */
  showActionView: function (viewData) {
    Session.set("admin/showActionView", true);
    ReactionCore.setActionView(viewData);
  },

  isActionViewOpen: function () {
    return Session.equals("admin/showActionView", true);
  },

  setActionView: function (viewData) {
    if (viewData) {
      Session.set("admin/actionView", viewData);
    } else {
      let registryItem = ReactionCore.getRegistryForCurrentRoute(
        "settings");

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
    return Session.get("admin/actionView");
  },

  hideActionView: function () {
    Session.set("admin/showActionView", false);
  },

  clearActionView: function () {
    Session.set("admin/actionView", undefined);
  },

  getCurrentTag: function () {
    if (Router.current().route.getName() === "/product/tag") {
      return Router.current().params._id;
    }
  },
  getRegistryForCurrentRoute: function (provides) {
    let routeName = Router.current().route.getName();
    // find registry entries for routeName
    let reactionApp = ReactionCore.Collections.Packages.findOne({
      // "registry.provides": provides,
      "registry.route": routeName
    }, {
      enabled: 1,
      registry: 1,
      name: 1,
      route: 1
    });

    if (reactionApp) {
      let settingsData = _.find(reactionApp.registry, function (item) {
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
 * client we'll cofigure WARN as default
 */
let isDebug = "WARN";

if (typeof Meteor.settings === "object" &&
  typeof Meteor.settings.public === "object" && Meteor.settings.public.debug) {
  isDebug = Meteor.settings.public.debug;
}

const levels = ["FATAL", "ERROR", "WARN", "INFO", "DEBUG", "TRACE"];

if (typeof isDebug !== "boolean" && typeof isDebug !== "undefined") {
  isDebug = isDebug.toUpperCase();
}

if (!_.contains(levels, isDebug)) {
  isDebug = "INFO";
}

ReactionCore.Log = bunyan.createLogger({
  name: "core-client"
});

ReactionCore.Log.level(isDebug);

/*
 * registerLoginHandler
 * method to create anonymous users
 */

Accounts.loginWithAnonymous = function (anonymous, callback) {
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

Meteor.startup(function () {
  // warn on insecure exporting of PackageRegistry settings
  if (typeof PackageRegistry !== "undefined" && PackageRegistry !== null) {
    let msg = "PackageRegistry: Insecure export to client.";
    ReactionCore.Log.warn(msg, PackageRegistry);
  }
  // init the core
  ReactionCore.init();
  // initialize anonymous guest users
  return Deps.autorun(function () {
    if (ReactionCore.allowGuestCheckout() && !Meteor.userId()) {
      Accounts.loginWithAnonymous();
    }
  });
});
