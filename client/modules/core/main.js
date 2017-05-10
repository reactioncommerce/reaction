import _ from "lodash";
import { Meteor } from "meteor/meteor";
import { Session } from "meteor/session";
import { check } from "meteor/check";
import { Tracker } from "meteor/tracker";
import { ReactiveVar } from "meteor/reactive-var";
import { ReactiveDict } from "meteor/reactive-dict";
import Logger from "/client/modules/logger";
import { Countries } from "/client/collections";
import { localeDep } from  "/client/modules/i18n";
import { Packages, Shops } from "/lib/collections";
import { Router } from "/client/modules/router";

// Global, private state object for client side
// This is placed outside the main object to make it a private variable.
// access using `Reaction.state`
const reactionState = new ReactiveDict();

/**
 * Reaction namespace
 * Global reaction shop permissions methods and shop initialization
 */
export default {
  shopId: null,

  Locale: new ReactiveVar({}),

  init() {
    // keep an eye out for shop change
    return Tracker.autorun(() => {
      let domain;
      let shop;

      if (this.Subscriptions.Shops.ready()) {
        domain = Meteor.absoluteUrl().split("/")[2].split(":")[0];
        shop = Shops.findOne({
          domains: domain
        });

        if (shop) {
          this.shopId = shop._id;
          this.shopName = shop.name;
          // initialize local client Countries collection
          if (!Countries.findOne()) {
            createCountryCollection(shop.locales.countries);
          }

          const locale = this.Locale.get() || {};

          // fix for https://github.com/reactioncommerce/reaction/issues/248
          // we need to keep an eye for rates changes
          if (typeof locale.locale === "object" &&
            typeof locale.currency === "object" &&
            typeof locale.locale.currency === "string") {
            const localeCurrency = locale.locale.currency.split(",")[0];
            if (typeof shop.currencies[localeCurrency] === "object") {
              if (typeof shop.currencies[localeCurrency].rate === "number") {
                locale.currency.rate = shop.currencies[localeCurrency].rate;
                localeDep.changed();
              }
            }
          }
          // we are looking for a shopCurrency changes here
          if (typeof locale.shopCurrency === "object") {
            locale.shopCurrency = shop.currencies[shop.currency];
            localeDep.changed();
          }
          return this;
        }
      }
    });
  },

  // Return global "reactionState" Reactive Dict
  get state() {
    return reactionState;
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
  hasPermission(checkPermissions, checkUserId, checkGroup) {
    let group = this.getShopId();
    let permissions = ["owner"];
    let id = "";
    const userId = checkUserId || this.userId || Meteor.userId();
    //
    // local roleCheck function
    // is the bulk of the logic
    // called out a userId is validated.
    //
    function roleCheck() {
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
      const sellerShopPermissions = Roles.getGroupsForUser(userId, "admin");
      // we're looking for seller permissions.
      if (sellerShopPermissions) {
        // loop through shops roles and check permissions
        for (const key in sellerShopPermissions) {
          if (key) {
            const shop = sellerShopPermissions[key];
            if (Roles.userIsInRole(userId, permissions, shop)) {
              return true;
            }
          }
        }
      }
      // no specific permissions found returning false
      return false;
    }

    //
    // check if a user id has been found
    // in line 156 setTimeout
    //
    function validateUserId() {
      if (Meteor.userId()) {
        Meteor.clearTimeout(id);
        Router.reload();
        return roleCheck();
      }
      return false;
    }

    //
    // actual logic block to check permissions
    // we'll bypass unecessary checks during
    // a user logging, as we'll check again
    // when everything is ready
    //
    if (Meteor.loggingIn() === false) {
      //
      // this userId check happens because when logout
      // occurs it takes a few cycles for a new anonymous user
      // to get created and during this time the user has no
      // permission, not even guest permissions so we
      // need to wait and reload the routes. This
      // mainly affects the logout from dashboard pages
      //
      if (!userId) {
        id = Meteor.setTimeout(validateUserId, 5000);
      } else {
        return roleCheck();
      }

      // default group to the shop or global if shop
      // isn't defined for some reason.
      if (checkGroup !== undefined && typeof checkGroup === "string") {
        group = checkGroup;
      }
      if (!group) {
        group = Roles.GLOBAL_GROUP;
      }
    }
    // return false to be safe
    return false;
  },

  hasOwnerAccess() {
    const ownerPermissions = ["owner"];
    return this.hasPermission(ownerPermissions);
  },

  hasAdminAccess() {
    const adminPermissions = ["owner", "admin"];
    return this.hasPermission(adminPermissions);
  },

  hasDashboardAccess() {
    const dashboardPermissions = ["owner", "admin", "dashboard"];
    return this.hasPermission(dashboardPermissions);
  },

  getUserPreferences(packageName, preference, defaultValue) {
    const user = Meteor.user();

    if (user) {
      const profile = Meteor.user().profile;
      if (profile && profile.preferences && profile.preferences[packageName] && profile.preferences[packageName][preference]) {
        return profile.preferences[packageName][preference];
      }
    }

    return defaultValue || undefined;
  },

  setUserPreferences(packageName, preference, value) {
    if (Meteor.user()) {
      return Meteor.users.update(Meteor.userId(), {
        $set: {
          [`profile.preferences.${packageName}.${preference}`]: value
        }
      });
    }
    return false;
  },

  updateUserPreferences(packageName, preference, values) {
    const currentPreference = this.getUserPreferences(packageName, preference, {});
    return this.setUserPreferences(packageName, preference, {
      ...currentPreference,
      ...values
    });
  },

  getShopId() {
    return this.shopId;
  },

  getShopName() {
    return this.shopName;
  },

  getShopPrefix() {
    return "/" + this.getSlug(this.getShopName().toLowerCase());
  },

  getShopSettings() {
    const settings = Packages.findOne({
      name: "core",
      shopId: this.shopId
    }) || {};
    return settings.settings || {};
  },

  getShopCurrency() {
    const shop = Shops.findOne({
      _id: this.shopId
    });

    return shop && shop.currency || "USD";
  },

  isPreview() {
    const viewAs = this.getUserPreferences("reaction-dashboard", "viewAs", "administrator");

    if (viewAs === "customer") {
      return true;
    }

    return false;
  },

  getPackageSettings(name) {
    return Packages.findOne({ name, shopId: this.getShopId() });
  },

  allowGuestCheckout() {
    let allowGuest = false;
    const settings = this.getShopSettings();
    // we can disable in admin, let's check.
    if (settings.public && settings.public.allowGuestCheckout) {
      allowGuest = settings.public.allowGuestCheckout;
    }
    return allowGuest;
  },

  getSellerShopId() {
    return Roles.getGroupsForUser(this.userId, "admin");
  },

  /**
   * @description showActionView
   *
   * @param {String} viewData {label, template, data}
   * @returns {String} Session "admin/showActionView"
   */
  showActionView(viewData) {
    Session.set("admin/showActionView", true);
    this.setActionView(viewData);
  },

  isActionViewOpen() {
    return Session.equals("admin/showActionView", true);
  },

  isActionViewDetailOpen() {
    return Session.equals("admin/showActionViewDetail", true);
  },


  setActionView(viewData) {
    if (viewData) {
      let viewStack;

      if (Array.isArray(viewData)) {
        viewStack = viewData;
      } else {
        viewStack = [viewData];
      }

      Session.set("admin/actionView", viewStack);
    } else {
      const registryItem = this.getRegistryForCurrentRoute(
        "settings");

      if (registryItem) {
        this.setActionView(registryItem);
      } else {
        this.setActionView({
          template: "blankControls"
        });
      }
    }
  },

  pushActionView(viewData) {
    Session.set("admin/showActionView", true);

    const actionViewStack = Session.get("admin/actionView");

    if (viewData) {
      actionViewStack.push(viewData);
      Session.set("admin/actionView", actionViewStack);
    } else {
      const registryItem = this.getRegistryForCurrentRoute(
        "settings");

      if (registryItem) {
        this.pushActionView(registryItem);
      } else {
        this.pushActionView({ template: "blankControls" });
      }
    }
  },

  isActionViewAtRootView() {
    const actionViewStack = Session.get("admin/actionView");

    if (Array.isArray(actionViewStack) && actionViewStack.length === 1) {
      return true;
    }

    return false;
  },

  popActionView() {
    const actionViewStack = Session.get("admin/actionView");
    actionViewStack.pop();

    Session.set("admin/actionView", actionViewStack);

    this.setActionViewDetail({}, { open: false });
  },

  setActionViewDetail(viewData, options = {}) {
    const { open } = options;

    Session.set("admin/showActionView", true);
    Session.set("admin/showActionViewDetail", typeof open === "boolean" ? open : true);

    if (viewData) {
      Session.set("admin/detailView", [viewData]);
    }
  },

  pushActionViewDetail(viewData) {
    Session.set("admin/showActionView", true);
    Session.set("admin/showActionViewDetail", true);

    const detailViewStack = Session.get("admin/detailView");

    if (viewData) {
      detailViewStack.push(viewData);
      Session.set("admin/detailView", detailViewStack);
    }
  },

  popActionViewDetail() {
    const detailViewStack = Session.get("admin/detailView");
    detailViewStack.pop();

    Session.set("admin/detailView", detailViewStack);
  },

  isActionViewDetailAtRootView() {
    const actionViewDetailStack = Session.get("admin/detailView");

    if (Array.isArray(actionViewDetailStack) && actionViewDetailStack.length === 1) {
      return true;
    }

    return false;
  },

  getActionView() {
    const actionViewStack = Session.get("admin/actionView");

    if (Array.isArray(actionViewStack) && actionViewStack.length) {
      return actionViewStack.pop();
    }

    return {};
  },

  getActionViewDetail() {
    const detailViewStack = Session.get("admin/detailView");

    if (Array.isArray(detailViewStack) && detailViewStack.length) {
      return detailViewStack.pop();
    }

    return {};
  },

  hideActionView() {
    Session.set("admin/showActionView", false);
    this.clearActionView();
  },

  hideActionViewDetail() {
    Session.set("admin/showActionViewDetail", false);
    this.clearActionViewDetail();
  },

  clearActionView() {
    Session.set("admin/actionView", [{
      label: "",
      i18nKeyLabel: ""
    }]);
    Session.set("admin/detailView", [{
      label: "",
      i18nKeyLabel: ""
    }]);
  },

  clearActionViewDetail() {
    Session.set("admin/detailView", [{
      label: "",
      i18nKeyLabel: ""
    }]);
  },

  getCurrentTag() {
    if (this.Router.getRouteName() === "tag") {
      return this.Router.current().params.slug;
    }
  },

  getRegistryForCurrentRoute(provides = "dashboard") {
    this.Router.watchPathChange();
    const currentRouteName = this.Router.getRouteName();
    const currentRoute = this.Router.current();
    const template = currentRoute.route.options.template;
    // find registry entries for routeName
    const reactionApp = Packages.findOne({
      "registry.name": currentRouteName,
      "registry.provides": provides,
      "enabled": true
    }, {
      enabled: 1,
      registry: 1,
      route: 1,
      name: 1,
      label: 1,
      settings: 1
    });

    // valid application
    if (reactionApp) {
      const settingsData = _.find(reactionApp.registry, function (item) {
        return item.provides === provides && item.template === template;
      });
      return settingsData;
    }
    Logger.debug("getRegistryForCurrentRoute not found", template, provides);
    return {};
  }

};

/**
 * createCountryCollection
 * Create a client-side only collection of Countries for a dropdown form
 * properly sorted*
 * @param {Object} countries -  The countries array on the Shop collection
 * @returns {Array} countryOptions - Sorted array of countries
 */
function createCountryCollection(countries) {
  check(countries, Object);
  const countryOptions = [];
  for (const locale in countries) {
    if ({}.hasOwnProperty.call(countries, locale)) {
      const country = countries[locale];
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

  for (const country of countryOptions) {
    Countries.insert(country);
  }
  return countryOptions;
}
