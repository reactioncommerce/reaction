import _ from "lodash";
import { Accounts as MeteorAccounts } from "meteor/accounts-base";
import { Meteor } from "meteor/meteor";
import { Session } from "meteor/session";
import { check } from "meteor/check";
import { Tracker } from "meteor/tracker";
import { ReactiveVar } from "meteor/reactive-var";
import { ReactiveDict } from "meteor/reactive-dict";
import { Roles } from "meteor/alanning:roles";
import Logger from "/client/modules/logger";
import { Countries } from "/client/collections";
import { Packages, Shops } from "/lib/collections";
import { Router } from "/client/modules/router";
import { DomainsMixin } from "./domains";
import { getUserId } from "./helpers/utils";

/**
 * Reaction core namespace for client code
 * @namespace Core/Client
 */

// Global, private state object for client side
// This is placed outside the main object to make it a private variable.
// access using `Reaction.state`
const reactionState = new ReactiveDict();

export const userPrefs = new ReactiveVar(undefined, (val, newVal) => JSON.stringify(val) === JSON.stringify(newVal));

// Slugify is imported when Reaction.getSlug is called
let slugify;

// Array of ISO Language codes for all languages that use latin based char sets
// list is based on this matrix http://w3c.github.io/typography/gap-analysis/language-matrix.html
// list of lang codes https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
const latinLangs = ["az", "da", "de", "en", "es", "ff", "fr", "ha", "hr", "hu", "ig", "is", "it", "jv", "ku", "ms", "nl", "no", "om", "pl", "pt", "ro", "sv", "sw", "tl", "tr", "uz", "vi", "yo"]; // eslint-disable-line max-len

export default {
  ...DomainsMixin,

  /**
   * @summary The active shop
   * @memberof Core/Client
   * @private
   */
  _shopId: new ReactiveVar(null),

  /**
   * @summary The first shop created
   * @memberof Core/Client
   * @private
   */
  _primaryShopId: new ReactiveVar(null),

  /**
   * @summary Marketplace Settings
   * @memberof Core/Client
   * @private
   */
  marketplace: { _ready: false },

  /**
   * @summary Initialization code
   * @memberof Core/Client
   * @method
   * @returns {Tracker} tracker
   */
  init() {
    // Listen for the primary shop subscription and set accordingly
    return Tracker.autorun(() => {
      let shop;
      if (this.Subscriptions.PrimaryShop.ready()) {
        // There should only ever be one "primary" shop
        shop = Shops.findOne({
          shopType: "primary"
        });

        if (shop) {
          this._primaryShopId.set(shop._id);

          // We'll initialize locale and currency for the primary shop

          // initialize local client Countries collection
          if (!Countries.findOne()) {
            createCountryCollection(shop.locales.countries);
          }

          // if we don't have an active shopId, try to retrieve it from the userPreferences object
          // and set the shop from the storedShopId
          if (!this.shopId) {
            const currentShop = this.getCurrentShop();

            if (currentShop) {
              this.shopId = currentShop._id;
              this.shopName = currentShop.name;
            }
          }
        }
      }
    });
  },

  /**
   * @summary Return global "reactionState" Reactive Dict
   * @memberof Core/Client
   */
  get state() {
    return reactionState;
  },

  /**
   * @name hasPermission
   * @summary client permissions checks. hasPermission exists on both the server and the client.
   * @method
   * @memberof Core/Client
   * @param {String | Array} checkPermissions -String or Array of permissions if empty, defaults to "admin, owner"
   * @param {String} checkUserId - userId, defaults to logged in user ID
   * @param {String} checkGroup group - default to shopId
   * @returns {Boolean} Boolean - true if has permission
   */
  hasPermission(checkPermissions, checkUserId, checkGroup) {
    let group;
    // default group to the shop or global if shop isn't defined for some reason.
    if (checkGroup !== undefined && typeof checkGroup === "string") {
      group = checkGroup;
    } else {
      group = this.getShopId() || Roles.GLOBAL_GROUP;
    }

    let permissions = ["owner"];
    let id = "";
    const userId = checkUserId || getUserId();
    //
    // local roleCheck function
    // is the bulk of the logic
    // called out a userId is validated.
    //
    /**
     * @description local roleCheck function is the bulk of the logic called out a userId is validated
     * @returns {Boolean} does user have permission
     */
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
      // if the user has owner permissions we'll always check if those roles are enough
      // By adding the "owner" role to the permissions list, we are making hasPermission always return
      // true for "owners". This gives owners global access.
      // TODO: Review this way of granting global access for owners
      permissions.push("owner");
      permissions = _.uniq(permissions);

      //
      // return if user has permissions in the group
      //
      if (Roles.userIsInRole(userId, permissions, group)) {
        return true;
      }

      // no specific permissions found returning false
      return false;
    }

    /**
     * @description check if a user id has been found in line 156 setTimeout
     * @returns {Boolean} is userId valid
     */
    function validateUserId() {
      if (getUserId()) {
        Meteor.clearTimeout(id);
        Router.reload();
        return roleCheck();
      }
      return false;
    }

    //
    // actual logic block to check permissions
    // we'll bypass unnecessary checks during
    // a user logging, as we'll check again
    // when everything is ready
    //
    let loggingIn;
    Tracker.nonreactive(() => {
      loggingIn = MeteorAccounts.loggingIn();
    });
    if (loggingIn === false) {
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
    }
    // return false to be safe
    return false;
  },


  /**
   * @name hasDashboardAccessForAnyShop
   * @summary client permission check for any "owner", "admin", or "dashboard" permissions for any shop.
   * @method
   * @memberof Core/Client
   * @todo This could be faster with a dedicated hasAdminDashboard boolean on the user object
   * @param { Object } options - options object that can be passed a user and/or a set of permissions
   * @returns {Boolean} Boolean - true if has dashboard access for any shop
   */
  hasDashboardAccessForAnyShop(options = { user: Meteor.user(), permissions: ["owner", "admin", "dashboard"] }) {
    const { user, permissions } = options;

    if (!user || !user.roles) {
      return false;
    }

    // Nested find that determines if a user has any of the permissions
    // specified in the `permissions` array for any shop
    const hasPermissions = Object.keys(user.roles).find((shopId) => user.roles[shopId].find((role) => permissions.find((permission) => permission === role)));

    // Find returns undefined if nothing is found.
    // This will return true if permissions are found, false otherwise
    return typeof hasPermissions !== "undefined";
  },

  /**
   * @name hasDashboardAccessForMultipleShops
   * @method
   * @memberof Core/Client
   * @summary - client permission check for any "owner", "admin", or "dashboard" permissions for more than one shop.
   * @returns {Boolean} Boolean - true if has dashboard access for more than one shop
   */
  hasDashboardAccessForMultipleShops() {
    const adminShopIds = this.getShopsForUser(["owner", "admin", "dashboard"]);
    return Array.isArray(adminShopIds) && adminShopIds.length > 1;
  },

  /**
   * @name hasOwnerAccess
   * @method
   * @memberof Core/Client
   * @returns {Boolean} Boolean - true if user has owner permissions
   */
  hasOwnerAccess() {
    const ownerPermissions = ["owner"];
    return this.hasPermission(ownerPermissions);
  },

  /**
   * Checks to see if the user has admin permissions. If a shopId is optionally
   * passed in, we check for that shopId, otherwise we check against the default
   * @name hasAdminAccess
   * @method
   * @memberof Core/Client
   * @param  {string} [shopId] Optional shopId to check access against
   * @returns {Boolean} true if the user has admin or owner permission, otherwise false
   */
  hasAdminAccess(shopId) {
    const adminPermissions = ["owner", "admin"];
    if (shopId) {
      return this.hasPermission(adminPermissions, getUserId(), shopId);
    }
    return this.hasPermission(adminPermissions);
  },

  /**
   * @name hasDashboardAccess
   * @method
   * @memberof Core/Client
   * @returns {Boolean} true if user has access to dashboard access
   */
  hasDashboardAccess() {
    const dashboardPermissions = ["owner", "admin", "dashboard"];
    return this.hasPermission(dashboardPermissions);
  },

  /**
   * @name hasShopSwitcherAccess
   * @method
   * @memberof Core/Client
   * @returns {Boolean} true if user has access to dashboard for multiple shops
   */
  hasShopSwitcherAccess() {
    return this.hasDashboardAccessForMultipleShops();
  },

  /**
   * @name getSellerShopId
   * @method
   * @memberof Core/Client
   * @param {String} userId user id of user to check seller shop ID for
   * @param {Boolean} noFallback should we allow function to continue if there is no userID
   * @returns {Boolean|String} the shop ID of a seller
   */
  getSellerShopId(userId = getUserId(), noFallback = false) {
    if (userId) {
      const group = Roles.getGroupsForUser(userId, "admin")[0];
      if (group) {
        return group;
      }
    }

    if (noFallback) {
      return false;
    }

    return this.getShopId();
  },

  /**
   * primaryShopId is the first created shop. In a marketplace setting it's
   * the shop that controls the marketplace and can see all other shops.
   * @name primaryShopId
   * @memberof Core/Client
   */
  get primaryShopId() {
    return this._primaryShopId.get();
  },

  /**
   * @name getPrimaryShopId
   * @method
   * @memberof Core/Client
   * @returns {String} primary shop ID
   */
  getPrimaryShopId() {
    return this._primaryShopId.get();
  },

  /**
   * @name getPrimaryShopName
   * @method
   * @memberof Core/Client
   * @returns {String} shop name
   */
  getPrimaryShopName() {
    const shopId = this.getPrimaryShopId();
    const shop = Shops.findOne({
      _id: shopId
    });

    if (shop && shop.name) {
      return shop.name;
    }

    // If we can't find the primaryShop return an empty string
    return "";
  },

  /**
   * @name getPrimaryShopSettings
   * @method
   * @memberof Core/Client
   * @returns {Object} shop settings of the primary shop
   */
  getPrimaryShopSettings() {
    const settings = Packages.findOne({
      name: "core",
      shopId: this.getPrimaryShopId()
    }) || {};
    return settings.settings || {};
  },

  /**
   * @name getCurrentShop
   * @summary Get the proper current shop based on various checks. This mirrors the logic in
   *   Reaction.getShopId on the server
   * @method
   * @memberof Core/Client
   * @returns {Object|null} The shop document
   */
  getCurrentShop() {
    // Give preference to shop chosen by the user
    const activeShopId = this.getUserShopId();
    if (activeShopId) return Shops.findOne({ _id: activeShopId });

    // If no chosen shop, look up the shop by domain
    let shop = Shops.findOne({ domains: this.getDomain() });

    // Finally fall back to primary shop
    if (!shop) shop = Shops.findOne({ shopType: "primary" });

    return shop;
  },

  /**
   * @name getUserShopId
   * @method
   * @memberof Core/Client
   * @summary Get current user's shop ID, as stored in preferences
   * @returns {String} active shop ID
   */
  getUserShopId() {
    const preferences = userPrefs.get(); // reactivity on `profile.preferences` changes only
    if (!preferences) return null;

    return _.get(preferences, "reaction.activeShopId");
  },

  /**
   * shopId refers to the active shop. For most shoppers this will be the same
   * as the primary shop, but for administrators this will usually be the shop
   * they administer.
   * @name shopId
   * @memberof Core/Client
   */
  get shopId() {
    return this._shopId.get();
  },

  /**
   * shopId refers to the active shop. For most shoppers this will be the same
   * as the primary shop, but for administrators this will usually be the shop
   * they administer.
   * @name getShopId
   * @method
   * @memberof Core/Client
   * @returns {String} shopId
   */
  getShopId() {
    return this.shopId || this.getUserShopId();
  },

  /**
   * shopId refers to the active shop. For most shoppers this will be the same
   * as the primary shop, but for administrators this will usually be the shop
   * they administer.
   * @name shopId
   * @param {String} id ID to set as shop ID
   * @memberof Core/Client
   */
  set shopId(id) {
    this._shopId.set(id);
  },

  /**
   * shopId refers to the active shop. For most shoppers this will be the same
   * as the primary shop, but for administrators this will usually be the shop
   * they administer.
   * @name setShopId
   * @method
   * @memberof Core/Client
   * @param {String} id ID to set as shop ID
   * @returns {undefined} undefined
   */
  setShopId(id) {
    if (!id || this.shopId === id) { return; }

    this.shopId = id;
    Meteor.call("accounts/setActiveShopId", id);
  },

  /**
   * @name isShopPrimary
   * @summary Whether the current shop is the Primary Shop (vs a Merchant Shop)
   * @returns {Boolean} does shopID equal primaryShopId
   */
  isShopPrimary() {
    return this.getShopId() === this.getPrimaryShopId();
  },

  /**
   * @name getShopName
   * @method
   * @memberof Core/Client
   * @summary gets name of shop by provided shopId, or current active shop if shopId is not provided
   * @param {String} providedShopId - shopId of shop to return name of
   * @returns {String} - shop name
   */
  getShopName(providedShopId) {
    const shopId = providedShopId || this.getShopId();
    const shop = Shops.findOne({
      _id: shopId
    });
    return shop && shop.name;
  },

  /**
   * @name getShopSettings
   * @method
   * @memberof Core/Client
   * @returns {Object} shop settings
   */
  getShopSettings() {
    const settings = Packages.findOne({
      name: "core",
      shopId: this.shopId
    }) || {};
    return settings.settings || {};
  },

  getShopLanguage() {
    const shopId = this.getShopId();
    const shop = Shops.findOne({ _id: shopId });
    return shop ? shop.language : "";
  },

  async getSlug(slugString) {
    const lazyLoadSlugify = async () => {
      let mod;
      const lang = this.getShopLanguage();

      // If slugify has been loaded but language has changed to non latin-based language, load transliteration
      if (slugify && slugify.name === "replace" && latinLangs.indexOf(lang) === -1) {
        mod = await import("transliteration");
      } else if (slugify) {
        // If slugify/transliteration is loaded & no lang change
        return;
      } else if (latinLangs.indexOf(lang) >= 0) {
        // If shop's language uses latin based chars, load slugify, else load transliteration's slugify
        mod = await import("slugify");
      } else {
        mod = await import("transliteration");
      }

      // Slugify is exported to modules.default while transliteration is exported to modules.slugify
      slugify = mod.default || mod.slugify;
    };

    let slug;
    await lazyLoadSlugify(); // eslint-disable-line promise/catch-or-return
    if (slugString && slugify) {
      slug = slugify(slugString.toLowerCase());
    } else {
      slug = "";
    }
    return slug;
  },

  /**
   * @name getPackageSettings
   * @method
   * @memberof Core/Client
   * @param {String} name package name
   * @returns {Object} package settings
   */
  getPackageSettings(name) {
    const shopId = this.getShopId();
    const query = { name };

    if (shopId) {
      query.shopId = shopId;
    }

    return Packages.findOne(query);
  },

  /**
   * @name getPackageSettingsWithOptions
   * @method
   * @memberof Core/Client
   * @param {Object} options options to pass to query
   * @returns {Object} package settings with options
   */
  getPackageSettingsWithOptions(options) {
    const query = options;
    return Packages.findOne(query);
  },

  /**
   * @name allowGuestCheckout
   * @method
   * @memberof Core/Client
   * @returns {Boolean} is guest checkout allowed
   */
  allowGuestCheckout() {
    const settings = this.getShopSettings();
    // we can disable in admin, let's check.
    return !!(settings.public && settings.public.allowGuestCheckout);
  },

  /**
   * (similar to server/api canInviteToGroup)
   * @name canInviteToGroup
   * @method
   * @memberof Core/Client
   * @summary checks if the user making the request is allowed to make invitation to that group
   * @param {Object} options -
   * @param {Object} options.group - group to invite to
   * @param {Object} options.user - user object  making the invite (Meteor.user())
   * @returns {Boolean} -
   */
  canInviteToGroup(options) {
    const { group } = options;
    let { user } = options;
    if (!user) {
      user = Meteor.user();
    }
    const userPermissions = user.roles[group.shopId];
    const groupPermissions = group.permissions;

    // granting invitation right for user with `owner` role in a shop
    if (this.hasPermission(["owner"], getUserId(), group.shopId)) {
      return true;
    }

    // checks that userPermissions includes all elements from groupPermissions
    // we are not using Reaction.hasPermission here because it returns true if the user has at least one
    return _.difference(groupPermissions, userPermissions).length === 0;
  },

  /**
   * @name showActionView
   * @method
   * @memberof Core/Client
   * @param {String} viewData {label, template, data}
   * @returns {String} Session "admin/showActionView"
   */
  showActionView(viewData) {
    Session.set("admin/showActionView", true);
    this.setActionView(viewData);
  },

  /**
   * @name isActionViewOpen
   * @method
   * @memberof Core/Client
   * @returns {Boolean} is action view open
   */
  isActionViewOpen() {
    return Session.equals("admin/showActionView", true);
  },

  /**
   * @name isActionViewDetailOpen
   * @method
   * @memberof Core/Client
   * @returns {Boolean} is action view detail open
   */
  isActionViewDetailOpen() {
    return Session.equals("admin/showActionViewDetail", true);
  },

  /**
   * @name setActionView
   * @method
   * @memberof Core/Client
   * @param {Array|Object} viewData data from open view
   * @returns {undefined}
   */
  setActionView(viewData) {
    this.hideActionViewDetail();
    if (viewData) {
      let viewStack;

      if (Array.isArray(viewData)) {
        viewStack = viewData;
      } else {
        viewStack = [viewData];
      }

      Session.set("admin/actionView", viewStack);
    } else {
      const registryItem = this.getRegistryForCurrentRoute("settings");

      if (registryItem) {
        this.setActionView(registryItem);
      } else {
        this.setActionView({
          template: "blankControls"
        });
      }
    }
  },

  /**
   * @name pushActionView
   * @method
   * @memberof Core/Client
   * @param {Array|Object} viewData data from open view
   * @returns {undefined}
   */
  pushActionView(viewData) {
    Session.set("admin/showActionView", true);

    const actionViewStack = Session.get("admin/actionView");

    if (viewData) {
      actionViewStack.push(viewData);
      Session.set("admin/actionView", actionViewStack);
    } else {
      const registryItem = this.getRegistryForCurrentRoute("settings");

      if (registryItem) {
        this.pushActionView(registryItem);
      } else {
        this.pushActionView({ template: "blankControls" });
      }
    }
  },

  /**
   * @name isActionViewAtRootView
   * @method
   * @memberof Core/Client
   * @returns {Boolean} is actionView at root view
   */
  isActionViewAtRootView() {
    const actionViewStack = Session.get("admin/actionView");

    if (Array.isArray(actionViewStack) && actionViewStack.length === 1) {
      return true;
    }

    return false;
  },

  /**
   * @name popActionView
   * @method
   * @memberof Core/Client
   * @returns {undefined}
   */
  popActionView() {
    const actionViewStack = Session.get("admin/actionView");
    actionViewStack.pop();

    Session.set("admin/actionView", actionViewStack);

    this.setActionViewDetail({}, { open: false });
  },

  /**
   * @name setActionViewDetail
   * @method
   * @memberof Core/Client
   * @param {Array|Object} viewData viewData to push
   * @param {Object} options to check if view is open
   * @returns {undefined}
   */
  setActionViewDetail(viewData, options = {}) {
    const { open } = options;

    Session.set("admin/showActionView", true);
    Session.set("admin/showActionViewDetail", typeof open === "boolean" ? open : true);
    Session.set("admin/detailView", [viewData]);
  },

  /**
   * @name pushActionViewDetail
   * @method
   * @memberof Core/Client
   * @param {Array|Object} viewData viewData to push
   * @returns {undefined}
   */
  pushActionViewDetail(viewData) {
    Session.set("admin/showActionView", true);
    Session.set("admin/showActionViewDetail", true);

    const detailViewStack = Session.get("admin/detailView");

    if (viewData) {
      detailViewStack.push(viewData);
      Session.set("admin/detailView", detailViewStack);
    }
  },

  /**
   * @name popActionViewDetail
   * @method
   * @memberof Core/Client
   * @returns {undefined}
   */
  popActionViewDetail() {
    const detailViewStack = Session.get("admin/detailView");
    detailViewStack.pop();

    Session.set("admin/detailView", detailViewStack);
  },

  /**
   * @name isActionViewDetailAtRootView
   * @method
   * @memberof Core/Client
   * @returns {Boolean} is action view detail at root view
   */
  isActionViewDetailAtRootView() {
    const actionViewDetailStack = Session.get("admin/detailView");

    if (Array.isArray(actionViewDetailStack) && actionViewDetailStack.length === 1) {
      return true;
    }

    return false;
  },

  /**
   * @name getActionView
   * @method
   * @memberof Core/Client
   * @returns {Object} current action view data
   */
  getActionView() {
    const actionViewStack = Session.get("admin/actionView");

    if (Array.isArray(actionViewStack) && actionViewStack.length) {
      return actionViewStack.pop();
    }

    return {};
  },

  /**
   * @name getActionViewDetail
   * @method
   * @memberof Core/Client
   * @returns {Object} current action view detail data
   */
  getActionViewDetail() {
    const detailViewStack = Session.get("admin/detailView");

    if (Array.isArray(detailViewStack) && detailViewStack.length) {
      return detailViewStack.pop();
    }

    return {};
  },

  /**
   * @name hideActionView
   * @method
   * @memberof Core/Client
   * @returns {undefined}
   */
  hideActionView() {
    Session.set("admin/showActionView", false);
    this.clearActionView();
  },

  /**
   * @name hideActionViewDetail
   * @method
   * @memberof Core/Client
   * @returns {undefined}
   */
  hideActionViewDetail() {
    Session.set("admin/showActionViewDetail", false);
    this.clearActionViewDetail();
  },

  /**
   * @name clearActionView
   * @method
   * @memberof Core/Client
   * @returns {undefined}
   */
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

  /**
   * @name clearActionViewDetail
   * @method
   * @memberof Core/Client
   * @returns {undefined}
   */
  clearActionViewDetail() {
    Session.set("admin/detailView", [{
      label: "",
      i18nKeyLabel: ""
    }]);
  },

  /**
   * @name getCurrentTag
   * @method
   * @memberof Core/Client
   * @returns {String} current tag
   */
  getCurrentTag() {
    if (this.Router.getRouteName() === "tag") {
      return this.Router.current().params.slug;
    }

    return null;
  },

  /**
   * @name getRegistryForCurrentRoute
   * @method
   * @memberof Core/Client
   * @param {String} provides type of template from registry
   * @returns {Object} settings data from this package
   */
  getRegistryForCurrentRoute(provides = "dashboard") {
    this.Router.watchPathChange();
    const currentRouteName = this.Router.getRouteName();
    const currentRoute = this.Router.current();
    const { template } = currentRoute.route.options;
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
      const settingsData = _.find(reactionApp.registry, (item) => item.provides && item.provides.includes(provides) && item.template === template);
      return settingsData;
    }
    Logger.debug("getRegistryForCurrentRoute not found", template, provides);
    return {};
  },

  /**
   * @name getMarketplaceSettings
   * @method
   * @memberof Core/Client
   * @summary finds the enabled `reaction-marketplace` package for the primary shop and returns the settings
   * @returns {Object} The marketplace settings from the primary shop or undefined
   */
  getMarketplaceSettings() {
    const marketplaceSettings = Packages.findOne({
      name: "reaction-marketplace",
      shopId: this.getPrimaryShopId(), // the primary shop always owns the marketplace settings
      enabled: true // only use the marketplace settings if marketplace is enabled
    });

    return marketplaceSettings && marketplaceSettings.settings;
  }
};

/**
 * Create a client-side only collection of Countries for a dropdown form
 * properly sorted*
 * @name createCountryCollection
 * @method
 * @param {Object} countries -  The countries array on the Shop collection
 * @returns {Array} countryOptions - Sorted array of countries
 * @private
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
  countryOptions.sort((itemA, itemB) => {
    if (itemA.label < itemB.label) {
      return -1;
    }
    if (itemA.label > itemB.label) {
      return 1;
    }
    return 0;
  });

  for (const country of countryOptions) {
    Countries.insert(country);
  }
  return countryOptions;
}
