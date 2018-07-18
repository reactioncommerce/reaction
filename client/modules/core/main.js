import _ from "lodash";
import store from "store";
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
import { localeDep } from "/client/modules/i18n";
import { Packages, Shops, Accounts } from "/lib/collections";
import { Router } from "/client/modules/router";
import { DomainsMixin } from "./domains";

/**
 * Reaction core namespace for client code
 * @namespace Core/Client
 */

// Global, private state object for client side
// This is placed outside the main object to make it a private variable.
// access using `Reaction.state`
const reactionState = new ReactiveDict();

export const userPrefs = new ReactiveVar(undefined, (val, newVal) => JSON.stringify(val) === JSON.stringify(newVal));

const deps = new Map();

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
   * @summary Current locale
   * @memberof Core/Client
   * @type {ReactiveVar}
   */
  Locale: new ReactiveVar({}),

  /**
   * @summary Initialization code
   * @memberof Core/Client
   * @method
   */
  init() {
    Tracker.autorun(() => {
      // marketplaceSettings come over on the PrimaryShopPackages subscription
      if (this.Subscriptions.PrimaryShopPackages.ready()) {
        if (!this.marketplace._ready) {
          const marketplacePkgSettings = this.getMarketplaceSettings();
          if (marketplacePkgSettings && marketplacePkgSettings.public) {
            this.marketplace._ready = true;
            this.marketplace = marketplacePkgSettings.public;
            this.marketplace.enabled = true;
          }
        }
      }
    });

    // Listen for the primary shop subscription and set accordingly
    Tracker.autorun(() => {
      let shop;
      if (this.Subscriptions.PrimaryShop.ready()) {
        // There should only ever be one "primary" shop
        shop = Shops.findOne({
          shopType: "primary"
        });

        if (shop) {
          this.primaryShopId = shop._id;
          this.primaryShopName = shop.name;

          // We'll initialize locale and currency for the primary shop unless
          // marketplace settings exist and merchantLocale is set to true
          if (this.marketplace.merchantLocale !== true) {
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
          }
        }
      }
    });

    // Listen for active shop change
    return Tracker.autorun(() => {
      let shop;
      if (this.Subscriptions.MerchantShops.ready()) {
        // if we don't have an active shopId, try to retrieve it from the userPreferences object
        // and set the shop from the storedShopId
        if (!this.shopId) {
          const storedShopId = this.getUserPreferences("reaction", "activeShopId");
          if (storedShopId) {
            shop = Shops.findOne({
              _id: storedShopId
            });
          } else {
            shop = Shops.findOne({
              domains: this.getDomain()
            });
          }
        }

        if (shop) {
          // Only set shopId if it hasn't been set yet
          if (!this.shopId) {
            this.shopId = shop._id;
            this.shopName = shop.name;
          }

          // We only use the active shop to setup locale if marketplace settings
          // are enabled and merchantLocale is set to true
          if (this.marketplace.merchantLocale === true) {
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
          }
          return this;
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
   * @param {String} checkUserId - userId, defaults to Meteor.userId()
   * @param {String} checkGroup group - default to shopId
   * @return {Boolean} Boolean - true if has permission
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
    const userId = checkUserId || Meteor.userId();
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

      // global roles check
      // TODO: Review this commented out code
      /*

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
      }*/
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
   * @return {Boolean} Boolean - true if has dashboard access for any shop
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
   * @name hasDashboardAccessForAnyShop
   * @method
   * @memberof Core/Client
   * @summary - client permission check for any "owner", "admin", or "dashboard" permissions for more than one shop.
   * @return {Boolean} Boolean - true if has dashboard access for more than one shop
   */
  hasDashboardAccessForMultipleShops() {
    const adminShopIds = this.getShopsForUser(["owner", "admin", "dashboard"]);
    return Array.isArray(adminShopIds) && adminShopIds.length > 1;
  },

  /**
   * @name hasOwnerAccess
   * @method
   * @memberof Core/Client
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
   * @return {Boolean} true if the user has admin or owner permission, otherwise false
   */
  hasAdminAccess(shopId) {
    const adminPermissions = ["owner", "admin"];
    if (shopId) {
      return this.hasPermission(adminPermissions, Meteor.userId(), shopId);
    }
    return this.hasPermission(adminPermissions);
  },

  /**
   * @name hasDashboardAccess
   * @method
   * @memberof Core/Client
   */
  hasDashboardAccess() {
    const dashboardPermissions = ["owner", "admin", "dashboard"];
    return this.hasPermission(dashboardPermissions);
  },

  /**
   * @name hasShopSwitcherAccess
   * @method
   * @memberof Core/Client
   */
  hasShopSwitcherAccess() {
    return this.hasDashboardAccessForMultipleShops();
  },

  /**
   * @name getSellerShopId
   * @method
   * @memberof Core/Client
   */
  getSellerShopId(userId = Meteor.userId(), noFallback = false) {
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
   * @name getUserPreferences
   * @method
   * @memberof Core/Client
   */
  getUserPreferences(packageName, preference, defaultValue) {
    getDep(`${packageName}.${preference}`).depend();
    if (Meteor.user()) {
      const packageSettings = store.get(packageName);
      // packageSettings[preference] should not be undefined or null.
      if (packageSettings && typeof packageSettings[preference] !== "undefined" && packageSettings[preference] !== null) {
        return packageSettings[preference];
      }
    }

    return defaultValue || undefined;
  },

  /**
   * @name setUserPreferences
   * @method
   * @memberof Core/Client
   */
  setUserPreferences(packageName, preference, value) {
    getDep(`${packageName}.${preference}`).changed();
    // User preferences are not stored in Meteor.user().profile
    // to prevent all autorun() with dependency on Meteor.user() to run again.
    if (Meteor.user()) {
      // "reaction" package settings should be synced to
      // the Accounts collection.
      const syncedPackages = ["reaction"];
      if (syncedPackages.indexOf(packageName) > -1) {
        Accounts.update(Meteor.userId(), {
          $set: {
            [`profile.preferences.${packageName}.${preference}`]: value
          }
        });
      }
    }
    const packageSettings = store.get(packageName) || {};
    packageSettings[preference] = value;
    return store.set(packageName, packageSettings);
  },

  /**
   * @name updateUserPreferences
   * @method
   * @memberof Core/Client
   */
  updateUserPreferences(packageName, preference, values) {
    const currentPreference = this.getUserPreferences(packageName, preference, {});
    return this.setUserPreferences(packageName, preference, {
      ...currentPreference,
      ...values
    });
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
   * primaryShopId is the first created shop. In a marketplace setting it's
   * the shop that controls the marketplace and can see all other shops.
   * @name primaryShopId
   * @memberof Core/Client
   */
  set primaryShopId(shopId) {
    this._primaryShopId.set(shopId);
  },

  /**
   * @name getPrimaryShopId
   * @method
   * @memberof Core/Client
   */
  getPrimaryShopId() {
    return this.primaryShopId;
  },

  /**
   * @name getPrimaryShopName
   * @method
   * @memberof Core/Client
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
   * Primary Shop should probably not have a prefix (or should it be /shop?)
   * @name getPrimaryShopPrefix
   * @method
   * @memberof Core/Client
   */
  getPrimaryShopPrefix() {
    return `/${this.getSlug(this.getPrimaryShopName().toLowerCase())}`;
  },

  /**
   * @name getPrimaryShopSettings
   * @method
   * @memberof Core/Client
   */
  getPrimaryShopSettings() {
    const settings = Packages.findOne({
      name: "core",
      shopId: this.getPrimaryShopId()
    }) || {};
    return settings.settings || {};
  },

  /**
   * @name getPrimaryShopCurrency
   * @method
   * @memberof Core/Client
   */
  getPrimaryShopCurrency() {
    const shop = Shops.findOne({
      _id: this.getPrimaryShopId()
    });

    return (shop && shop.currency) || "USD";
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
   */
  getShopId() {
    return this.shopId || this.getUserPreferences("reaction", "activeShopId");
  },

  /**
   * shopId refers to the active shop. For most shoppers this will be the same
   * as the primary shop, but for administrators this will usually be the shop
   * they administer.
   * @name shopId
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
   */
  setShopId(id) {
    if (!id || this.shopId === id) { return; }

    this.shopId = id;
    this.setUserPreferences("reaction", "activeShopId", id);

    Meteor.call("shop/resetShopId");
  },

  /**
   * @name isShopPrimary
   * @summary Whether the current shop is the Primary Shop (vs a Merchant Shop)
   * @return {Boolean}
   */
  isShopPrimary() {
    return this.getShopId() === this.getPrimaryShopId();
  },

  /**
   * @name getShopName
   * @method
   * @memberof Core/Client
   * @summary gets name of shop by provided shopId, or current active shop if shopId is not provided
   * @param {String} providedShopID - shopId of shop to return name of
   * @return {String} - shop name
   */
  getShopName(providedShopId) {
    const shopId = providedShopId || this.getShopId();
    const shop = Shops.findOne({
      _id: shopId
    });
    return shop && shop.name;
  },

  /**
   * @name getShopPrefix
   * @method
   * @memberof Core/Client
   */
  getShopPrefix() {
    const shopName = this.getShopName();
    if (shopName) {
      return Router.pathFor("index", {
        hash: {
          shopSlug: this.getSlug(shopName.toLowerCase())
        }
      });
    }
  },

  /**
   * @name getShopSettings
   * @method
   * @memberof Core/Client
   */
  getShopSettings() {
    const settings = Packages.findOne({
      name: "core",
      shopId: this.shopId
    }) || {};
    return settings.settings || {};
  },

  /**
   * @name isPreview
   * @method
   * @memberof Core/Client
   */
  isPreview() {
    const viewAs = this.getUserPreferences("reaction-dashboard", "viewAs", "administrator");

    if (viewAs === "customer") {
      return true;
    }

    return false;
  },

  /**
   * @name getPackageSettings
   * @method
   * @memberof Core/Client
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
   */
  getPackageSettingsWithOptions(options) {
    const query = options;
    return Packages.findOne(query);
  },

  /**
   * @name allowGuestCheckout
   * @method
   * @memberof Core/Client
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
   * @return {Boolean} -
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
    if (this.hasPermission(["owner"], Meteor.userId(), group.shopId)) {
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
   */
  isActionViewOpen() {
    return Session.equals("admin/showActionView", true);
  },

  /**
   * @name isActionViewDetailOpen
   * @method
   * @memberof Core/Client
   */
  isActionViewDetailOpen() {
    return Session.equals("admin/showActionViewDetail", true);
  },

  /**
   * @name setActionView
   * @method
   * @memberof Core/Client
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
   */
  hideActionView() {
    Session.set("admin/showActionView", false);
    this.clearActionView();
  },

  /**
   * @name hideActionViewDetail
   * @method
   * @memberof Core/Client
   */
  hideActionViewDetail() {
    Session.set("admin/showActionViewDetail", false);
    this.clearActionViewDetail();
  },

  /**
   * @name clearActionView
   * @method
   * @memberof Core/Client
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
   */
  getCurrentTag() {
    if (this.Router.getRouteName() === "tag") {
      return this.Router.current().params.slug;
    }
  },

  /**
   * @name getRegistryForCurrentRoute
   * @method
   * @memberof Core/Client
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
   * @return {Object} The marketplace settings from the primary shop or undefined
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
  countryOptions.sort((a, b) => {
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

/**
 * Gets the dependency for the key if available, else creates
 * a new dependency for the key and returns it.
 * @name getDep
 * @method
 * @param {String} -  The key to get the dependency for
 * @returns {Tracker.Dependency}
 * @private
 */
function getDep(key) {
  if (!deps.has(key)) {
    deps.set(key, new Tracker.Dependency());
  }
  return deps.get(key);
}
