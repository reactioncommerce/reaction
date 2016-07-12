import _ from "lodash";
import { Meteor } from "meteor/meteor";
import { Session } from "meteor/session";
import { check } from "meteor/check";
import { Tracker } from "meteor/tracker";
import { ReactiveVar } from "meteor/reactive-var";
import Logger from "/client/modules/logger";
import { Countries } from "/client/collections";
import { localeDep } from  "/client/modules/i18n";
import { Packages, Shops } from "/lib/collections";

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

  hasOwnerAccess() {
    let ownerPermissions = ["owner"];
    return this.hasPermission(ownerPermissions);
  },

  hasAdminAccess() {
    let adminPermissions = ["owner", "admin"];
    return this.hasPermission(adminPermissions);
  },

  hasDashboardAccess() {
    let dashboardPermissions = ["owner", "admin", "dashboard"];
    return this.hasPermission(dashboardPermissions);
  },

  getShopId() {
    return this.shopId;
  },

  getShopName() {
    return this.shopName;
  },

  allowGuestCheckout() {
    let allowGuest = false;
    const packageRegistry = Packages.findOne({
      name: "core",
      shopId: this.shopId
    });
    // we can disable in admin, let's check.
    if (typeof packageRegistry === "object" &&
      typeof packageRegistry.settings === "object" &&
      packageRegistry.settings.public.allowGuestCheckout) {
      allowGuest = packageRegistry.settings.public.allowGuestCheckout;
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

  setActionView(viewData) {
    if (viewData) {
      Session.set("admin/actionView", viewData);
    } else {
      let registryItem = this.getRegistryForCurrentRoute(
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

  getActionView() {
    return Session.get("admin/actionView");
  },

  hideActionView() {
    Session.set("admin/showActionView", false);
  },

  clearActionView() {
    Session.set("admin/actionView", {
      label: "",
      i18nKeyLabel: ""
    });
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
    let reactionApp = Packages.findOne({
      "registry.name": currentRouteName,
      "registry.provides": provides
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
    Countries.insert(country);
  }
  return countryOptions;
}
