import Logger from "@reactioncommerce/logger";
import _ from "lodash";
import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Roles } from "meteor/alanning:roles";
import * as Collections from "/lib/collections";
import ConnectionDataStore from "/imports/plugins/core/core/server/util/connectionDataStore";
import { AbsoluteUrlMixin } from "./absoluteUrl";
import { getUserId } from "./accountUtils";

/**
 * @file Server core methods
 *
 * @namespace Core
 */

// Unpack the named Collections we use.
const { Packages, Shops, Accounts: AccountsCollection } = Collections;

export default {
  ...AbsoluteUrlMixin,

  Packages: {},

  /**
   * @summary This is used only for the old `registerPackage` in this file. After that is removed,
   *   this likely can be removed, too.
   * @param {ReactionNodeApp} app App instance
   * @returns {undefined}
   */
  async onAppInstanceCreated(app) {
    this.reactionNodeApp = app;
    if (this.whenAppInstanceReadyCallbacks) {
      for (const callback of this.whenAppInstanceReadyCallbacks) {
        await callback(this.reactionNodeApp); // eslint-disable-line no-await-in-loop
      }
      this.whenAppInstanceReadyCallbacks = [];
    }
  },

  /**
   * @summary This is used only for the old `registerPackage` in this file. After that is removed,
   *   this likely can be removed, too.
   * @param {Function} callback Function to call after `this.reactionNodeApp` is set, which might be immediately
   * @returns {undefined}
   */
  whenAppInstanceReady(callback) {
    if (this.reactionNodeApp) {
      callback(this.reactionNodeApp);
    } else {
      if (!this.whenAppInstanceReadyCallbacks) this.whenAppInstanceReadyCallbacks = [];
      this.whenAppInstanceReadyCallbacks.push(callback);
    }
  },

  /**
   * @summary Called to indicate that startup is done, causing all
   *   `onAppStartupComplete` callbacks to run in series.
   * @returns {undefined}
   */
  async emitAppStartupComplete() {
    if (this.appStartupIsComplete) return;
    this.appStartupIsComplete = true;
    if (this.onAppStartupCompleteCallbacks) {
      for (const callback of this.onAppStartupCompleteCallbacks) {
        await callback(this.reactionNodeApp); // eslint-disable-line no-await-in-loop
      }
      this.onAppStartupCompleteCallbacks = [];
    }
  },

  /**
   * @summary Register a function to be called once after the app startup is
   *   fully done running.
   * @param {Function} callback Function to call after app startup, which might be immediately
   * @returns {undefined}
   */
  onAppStartupComplete(callback) {
    if (this.appStartupIsComplete) {
      callback(this.reactionNodeApp);
    } else {
      if (!this.onAppStartupCompleteCallbacks) this.onAppStartupCompleteCallbacks = [];
      this.onAppStartupCompleteCallbacks.push(callback);
    }
  },

  /**
   * @deprecated Use `app.registerPlugin` pattern instead. See the simple-pricing plugin.
   * @param {Object} packageInfo Plugin options
   * @returns {Object} Plugin options
   */
  registerPackage(packageInfo) {
    this.whenAppInstanceReady((app) => app.registerPlugin(packageInfo));
  },

  defaultCustomerRoles: ["guest", "account/profile", "product", "tag", "index", "cart/completed"],
  defaultVisitorRoles: ["anonymous", "guest", "product", "tag", "index", "cart/completed"],

  /**
   * @name canInviteToGroup
   * @method
   * @memberof Core
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
   * @name hasPermission
   * @method
   * @memberof Core
   * @summary server permissions checks hasPermission exists on both the server and the client.
   * @param {String | Array} checkPermissions -String or Array of permissions if empty, defaults to "admin, owner"
   * @param {String} userId - userId, defaults to logged in userId
   * @param {String} checkGroup group - default to shopId
   * @returns {Boolean} Boolean - true if has permission
   */
  hasPermission(checkPermissions, userId = getUserId(), checkGroup = this.getShopId()) {
    // check(checkPermissions, Match.OneOf(String, Array)); check(userId, String); check(checkGroup,
    // Match.Optional(String));
    let permissions;
    // default group to the shop or global if shop isn't defined for some reason.
    let group;
    if (checkGroup !== undefined && typeof checkGroup === "string") {
      group = checkGroup;
    } else {
      group = this.getShopId() || Roles.GLOBAL_GROUP;
    }

    // permissions can be either a string or an array we'll force it into an array and use that
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

    // return if user has permissions in the group
    return Roles.userIsInRole(userId, permissions, group);
  },

  /**
   * @name hasOwnerAccess
   * @method
   * @memberof Core
   * @returns {Boolean} Boolean - true if has permission
   */
  hasOwnerAccess() {
    return this.hasPermission(["owner"]);
  },

  /**
   * @name hasAdminAccess
   * @method
   * @memberof Core
   * @returns {Boolean} Boolean - true if has permission
   */
  hasAdminAccess() {
    return this.hasPermission(["owner", "admin"]);
  },

  /**
   * @name hasDashboardAccess
   * @method
   * @memberof Core
   * @returns {Boolean} Boolean - true if has permission
   */
  hasDashboardAccess() {
    return this.hasPermission(["owner", "admin", "dashboard"]);
  },

  /**
   * @summary Finds all shops that a user has a given set of roles for
   * @name getShopsWithRoles
   * @method
   * @memberof Core
   * @param  {array} roles an array of roles to check. Will return a shopId if the user has _any_ of the roles
   * @param  {string} userId Optional userId, defaults to logged in userId
   *                                           Must pass this.userId from publications to avoid error!
   * @returns {Array} Array of shopIds that the user has at least one of the given set of roles for
   */
  getShopsWithRoles(roles, userId = getUserId()) {
    // Owner permission for a shop supersedes grantable permissions, so we always check for owner permissions as well
    roles.push("owner");

    // Reducer that returns a unique list of shopIds that results from calling getGroupsForUser for each role
    return roles.reduce((shopIds, role) => {
      // getGroupsForUser will return a list of shops for which this user has the supplied role for
      const shopIdsUserHasRoleFor = Roles.getGroupsForUser(userId, role);

      // If we have new shopIds found, add them to the list
      if (Array.isArray(shopIdsUserHasRoleFor) && shopIdsUserHasRoleFor.length > 0) {
        // Create unique array from existing shopIds array and the shops
        return [...new Set([...shopIds, ...shopIdsUserHasRoleFor])];
      }

      // IF we don't have any shopIds returned, keep our existing list
      return shopIds;
    }, []);
  },

  /**
   * @name getSellerShopId
   * @method
   * @memberof Core
   * @returns {String} Shop ID
   */
  getSellerShopId() {
    return Roles.getGroupsForUser(this.userId, "admin");
  },

  /**
   * @name getPrimaryShop
   * @summary Get the first created shop. In marketplace, the Primary Shop is the shop that controls the marketplace
   * and can see all other shops
   * @method
   * @memberof Core
   * @returns {Object} Shop
   */
  getPrimaryShop() {
    const primaryShop = Shops.findOne({
      shopType: "primary"
    });

    return primaryShop;
  },

  /**
   * @name getPrimaryShopId
   * @summary Get the first created shop ID. In marketplace, the Primary Shop is the shop that controls the marketplace
   * and can see all other shops
   * @method
   * @memberof Core
   * @returns {String} ID
   */
  getPrimaryShopId() {
    const primaryShop = this.getPrimaryShop();

    if (!primaryShop) { return null; }

    return primaryShop._id;
  },

  /**
   * @name getPrimaryShopName
   * @method
   * @summary Get primary shop name or empty string
   * @memberof Core
   * @returns {String} Return shop name or empty string
   */
  getPrimaryShopName() {
    const primaryShop = this.getPrimaryShop();
    if (primaryShop) {
      return primaryShop.name;
    }
    return "";
  },

  /**
   * @name getPrimaryShopPrefix
   * @summary Get primary shop prefix for URL
   * @memberof Core
   * @method
   * @todo Primary Shop should probably not have a prefix (or should it be /shop?)
   * @returns {String} Prefix in the format of "/<slug>"
   */
  getPrimaryShopPrefix() {
    return `/${this.getSlug(this.getPrimaryShopName().toLowerCase())}`;
  },

  /**
   * @name getPrimaryShopSettings
   * @method
   * @memberof Core
   * @summary Get primary shop settings object
   * @returns {Object} Get settings object or empty object
   */
  getPrimaryShopSettings() {
    const settings = Packages.findOne({
      name: "core",
      shopId: this.getPrimaryShopId()
    }) || {};
    return settings.settings || {};
  },

  /**
   * @summary **DEPRECATED** This method has been deprecated in favor of using getShopId
   * and getPrimaryShopId. To be removed.
   * @deprecated
   * @memberof Core
   * @method getCurrentShopCursor
   * @returns {Cursor} cursor of shops that match the current domain
   */
  getCurrentShopCursor() {
    const domain = this.getDomain();
    const cursor = Shops.find({
      domains: domain
    });
    if (!cursor.count()) {
      Logger.debug(domain, "Add a domain entry to shops for ");
    }
    return cursor;
  },

  /**
   * @summary **DEPRECATED** This method has been deprecated in favor of using getShopId
   * and getPrimaryShopId. To be removed.
   * @deprecated
   * @memberof Core
   * @method getCurrentShop
   * @returns {Object} returns the first shop object from the shop cursor
   */
  getCurrentShop() {
    const currentShopCursor = this.getCurrentShopCursor();
    // also, we could check in such a way: `currentShopCursor instanceof Object` but not instanceof something.Cursor
    if (typeof currentShopCursor === "object") {
      return currentShopCursor.fetch()[0];
    }
    return null;
  },

  /**
   * @name getShopId
   * @method
   * @memberof Core
   * @summary Get shop ID, first by checking the current user's preferences
   * then by getting the shop by the current domain.
   * @todo should we return the Primary Shop if none found?
   * @returns {String} active shop ID
   */
  getShopId() {
    // is there a stored value?
    let shopId = ConnectionDataStore.get("shopId");

    // if so, return it
    if (shopId) {
      return shopId;
    }

    try {
      // otherwise, find the shop by user settings
      shopId = this.getUserShopId(getUserId());
    } catch (_e) {
      // an error when invoked outside of a method
      // call or publication, i.e., at startup. That's ok here.
    }

    // if still not found, look up the shop by domain
    if (!shopId) {
      shopId = this.getShopIdByDomain();
    }

    // use the primary shop id by default
    if (!shopId) {
      const domain = this.connectionDomain();
      Logger.warn(`No shop matching domain '${domain}'. Defaulting to Primary Shop.`);

      shopId = this.getPrimaryShopId();
    }

    // store the value for faster responses
    ConnectionDataStore.set("shopId", shopId);

    return shopId;
  },

  /**
   * @name clearCache
   * @method
   * @memberof Core
   * @summary allows the client to trigger an uncached lookup of the shopId.
   *          this is useful when a user switches shops.
   * @returns {undefined}
   */
  resetShopId() {
    ConnectionDataStore.clear("shopId");
  },

  /**
   * @name isShopPrimary
   * @summary Whether the current shop is the Primary Shop (vs a Merchant Shop)
   * @method
   * @memberof Core
   * @returns {Boolean} whether shop is flagged as primary
   */
  isShopPrimary() {
    return this.getShopId() === this.getPrimaryShopId();
  },

  /**
   * @name getShopIdByDomain
   * @method
   * @memberof Core
   * @summary searches for a shop which should be used given the current domain
   * @returns {StringId} shopId
   */
  getShopIdByDomain() {
    const domain = this.getDomain();
    const primaryShop = this.getPrimaryShop();

    // in cases where the domain could match multiple shops, we first check
    // whether the primaryShop matches the current domain. If so, we give it
    // priority
    if (primaryShop && Array.isArray(primaryShop.domains) && primaryShop.domains.includes(domain)) {
      return primaryShop._id;
    }

    const shop = Shops.find({
      domains: domain
    }, {
      limit: 1,
      fields: {
        _id: 1
      }
    }).fetch()[0];

    return shop && shop._id;
  },

  /**
   * @name getUserShopId
   * @method
   * @memberof Core
   * @summary Get a user's shop ID, as stored in preferences
   * @param {String} userId (probably logged in userId)
   * @returns {String} active shop ID
   */
  getUserShopId(userId) {
    check(userId, String);

    const user = AccountsCollection.findOne({ _id: userId });
    if (!user) return null;

    return _.get(user, "profile.preferences.reaction.activeShopId");
  },

  /**
   * @name getCartShopId
   * @method
   * @memberof Core
   * @summary Get the correct shop ID to use for Cart collection
   * @returns {StringId} The primary or current shop ID, depending on merchantCart setting
   */
  getCartShopId() {
    const marketplaceSettings = this.getMarketplaceSettings();
    let shopId;
    if (marketplaceSettings && marketplaceSettings.public && marketplaceSettings.public.merchantCart) {
      shopId = this.getShopId();
    } else {
      shopId = this.getPrimaryShopId();
    }
    return shopId;
  },

  /**
   * @name getShopName
   * @method
   * @memberof Core
   * @summary If we can't find the shop or shop name return an empty string
   * @returns {String} Shop name or empty string ""
   */
  getShopName() {
    const shopId = this.getShopId();
    let shop;
    if (shopId) {
      shop = Shops.findOne({
        _id: shopId
      }, {
        fields: {
          name: 1
        }
      });
    } else {
      const domain = this.getDomain();
      shop = Shops.findOne({
        domains: domain
      }, {
        fields: {
          name: 1
        }
      });
    }
    if (shop && shop.name) {
      return shop.name;
    }
    return "";
  },

  /**
   * @name getShopEmail
   * @method
   * @memberof Core
   * @summary Get shop email
   * @returns {String} String with the first store email
   */
  getShopEmail() {
    const shop = Shops.find({
      _id: this.getShopId()
    }, {
      limit: 1,
      fields: {
        emails: 1
      }
    }).fetch()[0];
    return shop && shop.emails && shop.emails[0].address;
  },

  /**
   * @name getShopSettings
   * @method
   * @memberof Core
   * @summary Get shop settings object
   * @param  {String} [name="core"] Package name
   * @returns {Object}               Shop settings object or empty object
   */
  getShopSettings(name = "core") {
    const settings = Packages.findOne({ name, shopId: this.getShopId() }) || {};
    return settings.settings || {};
  },

  /**
   * @name getShopCurrency
   * @method
   * @memberof Core
   * @summary Get shop currency
   * @returns {String} Shop currency or "USD"
   */
  getShopCurrency() {
    const shop = Shops.findOne({
      _id: this.getShopId()
    });

    return (shop && shop.currency) || "USD";
  },

  /**
   * @name getShopCurrencies
   * @method
   * @memberof Core
   * @summary Get all currencies available to a shop
   * @returns {Object} Shop currency or "USD"
   */
  getShopCurrencies() {
    const shop = Shops.findOne({
      _id: this.getShopId()
    });

    return shop && shop.currencies;
  },

  /**
   * @name getShopLanguage
   * @method
   * @memberof Core
   * @todo TODO: Marketplace - should each shop set their own default language or
   * should the Marketplace set a language that's picked up by all shops?
   * @returns {String} language
   */
  getShopLanguage() {
    const { language } = Shops.findOne({
      _id: this.getShopId()
    }, {
      fields: {
        language: 1
      }
    });
    return language;
  },

  /**
   * @name getPackageSettings
   * @method
   * @memberof Core
   * @summary Get package settings
   * @param  {String} name Package name
   * @returns {Object|null}      Package setting object or null
   */
  getPackageSettings(name) {
    return Packages.findOne({ name, shopId: this.getShopId() }) || null;
  },

  /**
   * @name getMarketplaceSettings
   * @method
   * @memberof Core
   * @summary finds the enabled `reaction-marketplace` package for
   * the primary shop and returns the settings
   * @returns {Object} The marketplace settings from the primary shop or undefined
   */
  getMarketplaceSettings() {
    const marketplace = Packages.findOne({
      name: "reaction-marketplace",
      shopId: this.getPrimaryShopId(),
      enabled: true
    });

    if (marketplace && marketplace.settings) {
      return marketplace.settings;
    }
    return {};
  },

  /**
   * @summary Method for getting all schemas attached to a given collection
   * @deprecated by simpl-schema
   * @private
   * @name collectionSchema
   * @param  {string} collection The mongo collection to get schemas for
   * @param  {Object} [selector] Optional selector for multi schema collections
   * @returns {Object} Returns a simpleSchema that is a combination of all schemas
   *                  that have been attached to the collection or false if
   *                  the collection or schema could not be found
   */
  collectionSchema(collection, selector) {
    Logger.warn("Reaction.collectionSchema is deprecated and will be removed" +
      " in a future release. Use collection.simpleSchema(selector).");

    const selectorErrMsg = selector ? `and selector ${selector}` : "";
    const errMsg = `Reaction.collectionSchema could not find schemas for ${collection} collection ${selectorErrMsg}`;

    const col = Collections[collection];
    if (!col) {
      Logger.warn(errMsg);
      // Return false so we don't pass a check that uses a non-existent schema
      return false;
    }

    const schema = col.simpleSchema(selector);
    if (!schema) {
      Logger.warn(errMsg);
      // Return false so we don't pass a check that uses a non-existent schema
      return false;
    }

    return schema;
  }
};
