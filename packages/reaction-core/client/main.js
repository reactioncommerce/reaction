/**
 * ReactionCore
 * Global reaction shop permissions methods and shop initialization
 */
_.extend(ReactionCore, {
  shopId: null,
  init: function () {
    let self;
    self = this;
    // keep an eye out for shop change
    return Tracker.autorun(function () {
      let domain;
      let shop;
      // for clarity this subscription is defined in subscriptions.js
      if (ReactionCore.Subscriptions.Shops.ready()) {
        domain = Meteor.absoluteUrl().split("/")[2].split(":")[0];
        shop = ReactionCore.Collections.Shops.findOne({
          domains: domain
        });
        self.shopId = shop._id;
        createCountryCollection(shop);

        // fix for https://github.com/reactioncommerce/reaction/issues/248
        // we need to keep an eye for rates changes
        const { Locale } = ReactionCore;
        if (typeof Locale.locale === "object" &&
          typeof Locale.currency === "object" &&
          typeof Locale.locale.currency === "string") {
          const localeCurrency = Locale.locale.currency.split(",")[0];
          if (typeof shop.currencies[localeCurrency] === "object") {
            if (typeof shop.currencies[localeCurrency].rate === "number") {
              Locale.currency.rate = shop.currencies[localeCurrency].rate;
              localeDep.changed();
            }
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
   * hasPermission - client
   * client permissions checks
   * hasPermission exists on both the server and the client.
   *
   * @param {String | Array} checkPermissions -String or Array of permissions if empty, defaults to "admin, owner"
   * @param {String} checkUserId - userId, defaults to Meteor.userId()
   * @param {String} checkGroup group - default to shopId
   * @return {Boolean} Boolean - true if has permission
   */
  hasPermission: function (checkPermissions, checkUserId, checkGroup) {
    let group = ReactionCore.getShopId();
    let permissions = ["owner"];

    // default group to the shop or global if shop
    // isn't defined for some reason.
    if (checkGroup !== undefined && typeof checkGroup === "string") {
      group = checkGroup;
    }
    if (!group) {
      group = Roles.GLOBAL_GROUP;
    }

    // use current user if userId if not provided
    // becauase you gotta have a user to check permissions
    const userId = checkUserId || this.userId || Meteor.userId();
    if (!userId) {
      return false;
    }
    // permissions can be either a string or an array
    // we'll force it into an array and use that
    if (checkPermissions === undefined) {
      permissions = ["owner"];
    } else if (typeof checkPermissions === "string") {
      permissions = [checkPermissions];
    } else {
      permissions = checkPermissions;
    }
    // if the user has admin, owner permissions we'll always check if those roles are enough
    permissions.push("owner");
    permissions = _.uniq(permissions);

    //
    // return if user has permissions in the group
    //
    if (Roles.userIsInRole(userId, permissions, group)) {
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
          if (Roles.userIsInRole(userId, permissions, shop)) {
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
    if (ReactionRouter.getRouteName() === "/product/tag") {
      return ReactionRouter.current().params._id;
    }
  },
  getRegistryForCurrentRoute: (provides = "dashboard") => {
    const currentRoute = ReactionRouter.current();
    const routeName = currentRoute.route.path.replace("/", "");

    // find registry entries for routeName
    let reactionApp = ReactionCore.Collections.Packages.findOne({
      "registry.provides": provides,
      "registry.route": routeName
    }, {
      enabled: 1,
      registry: 1,
      route: 1,
      name: 1,
      label: 1
    });
    // valid application
    if (reactionApp) {
      let settingsData = _.find(reactionApp.registry, function (item) {
        return item.provides === provides && item.route === routeName;
      });
      return settingsData;
    }
    ReactionCore.Log.debug("getRegistryForCurrentRoute not found", routeName, provides);
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
  // We need to be sure that every user will work inside a session. Sometimes
  // session could be destroyed, for example, by clearing browser's cache. In
  // that case we need to take care about creating new session before new
  // user or anonymous will be created/logged in.
  // The problem here - looks like where is no way to track localStorage:
  // `amplify.store("ReactionCore.session")` itself. That's why we need to use
  // another way: `accounts` package uses `setTimeout` for monitoring connection
  // Accounts.callLoginMethod will be called after clearing cache. We could
  // latch on this computations by running extra check here.
  if (typeof amplify.store("ReactionCore.session") !== "string") {
    const newSession = Random.id();
    amplify.store("ReactionCore.session", newSession);
    Session.set("sessionId", newSession);
  }
  Accounts.callLoginMethod({
    methodArguments: [{
      anonymous: true,
      sessionId: Session.get("sessionId")
    }],
    userCallback: callback
  });
};

// @see https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API
let hidden;
// let visibilityState; // keep this for a some case
if (typeof document.hidden !== "undefined") {
  hidden = "hidden";
  // visibilityState = "visibilityState";
} else if (typeof document.mozHidden !== "undefined") {
  hidden = "mozHidden";
  // visibilityState = "mozVisibilityState";
} else if (typeof document.msHidden !== "undefined") {
  hidden = "msHidden";
  // visibilityState = "msVisibilityState";
} else if (typeof document.webkitHidden !== "undefined") {
  hidden = "webkitHidden";
  // visibilityState = "webkitVisibilityState";
}

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
  return Tracker.autorun(function () {
    const userId = Meteor.userId();
    // TODO: maybe `visibilityState` will be better here
    let isHidden;
    let guestAreAllowed;
    let loggingIn;
    let sessionId;
    Tracker.nonreactive(function () {
      guestAreAllowed = ReactionCore.allowGuestCheckout();
      isHidden = document[hidden];
      loggingIn = Accounts.loggingIn();
      sessionId = amplify.store("ReactionCore.session");
    });
    if (guestAreAllowed && !userId) {
      if (!isHidden && !loggingIn || typeof sessionId !== "string") {
        Accounts.loginWithAnonymous();
      }
    }
  });
});

/**
 * createCountryCollection
 * Create a client-side only collection of Countries for a dropdown form
 * properly sorted*
 * @param {Object} shop -  currentShop
 * @returns {Array} countryOptions - Sorted array of countries
 */
createCountryCollection = function (shop) {
  check(shop, ReactionCore.Schemas.Shop);
  ReactionCore.Collections.Countries = new Mongo.Collection(null);
  const countryOptions = [];
  const countries = shop.locales.countries;
  for (let locale in countries) {
    if ({}.hasOwnProperty.call(countries, locale)) {
      let country = countries[locale];
      countryOptions.push({
        label: country.name,
        value: locale
      });
    }
  }
  countryOptions.sort(function (a, b) {
    if (a.label < b.label) {
      return -1;
    }
    if (a.label > b.label) {
      return 1;
    }
    return 0;
  });

  for (let country of countryOptions) {
    ReactionCore.Collections.Countries.insert(country);
  }
  return countryOptions;
};
