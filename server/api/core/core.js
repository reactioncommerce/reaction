import url from "url";
import packageJson from "/package.json";
import _, { merge, uniqWith } from "lodash";
import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Random } from "meteor/random";
import { Accounts } from "meteor/accounts-base";
import { Roles } from "meteor/alanning:roles";
import { EJSON } from "meteor/ejson";
import * as Collections from "/lib/collections";
import { Hooks, Logger } from "/server/api";
import ProcessJobs from "/server/jobs";
import { registerTemplate } from "./templates";
import { sendVerificationEmail } from "./accounts";
import { getMailUrl } from "./email/config";
import { createGroups } from "./groups";
import ConnectionDataStore from "./connectionDataStore";

/**
 * @file Server core methods
 *
 * @namespace Core
 */

// Unpack the named Collections we use.
const { Jobs, Packages, Shops, Accounts: AccountsCollection } = Collections;

export default {
  init() {
    // run beforeCoreInit hooks
    Hooks.Events.run("beforeCoreInit");

    // make sure the default shop has been created before going further
    while (!this.getShopId()) {
      Logger.warn("No shopId, waiting one second...");
      Meteor._sleepForMs(1000);
    }

    // run onCoreInit hooks
    Hooks.Events.run("onCoreInit");

    // start job server
    Jobs.startJobServer(() => {
      Logger.info("JobServer started");
      ProcessJobs();
      Hooks.Events.run("onJobServerStart");
    });
    if (process.env.VERBOSE_JOBS) {
      Jobs.setLogStream(process.stdout);
    }

    this.loadPackages();
    // process imports from packages and any hooked imports
    this.Importer.flush();
    this.createGroups();
    // timing is important, packages are rqd for initial permissions configuration.
    if (!Meteor.isAppTest) {
      this.createDefaultAdminUser();
    }
    this.setAppVersion();
    // hook after init finished
    Hooks.Events.run("afterCoreInit");

    Logger.debug("Reaction.init() has run");

    return true;
  },

  Packages: {},

  registerPackage(packageInfo) {
    this.Packages[packageInfo.name] = packageInfo;
    const registeredPackage = this.Packages[packageInfo.name];
    return registeredPackage;
  },
  defaultCustomerRoles: ["guest", "account/profile", "product", "tag", "index", "cart/checkout", "cart/completed"],
  defaultVisitorRoles: ["anonymous", "guest", "product", "tag", "index", "cart/checkout", "cart/completed"],
  createGroups,

  /**
   * @name canInviteToGroup
   * @method
   * @memberof Core
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
   * @name registerTemplate
   * @method
   * @memberof Core
   * @summary Registers Templates into the Templates Collection
   * @return {function} Registers template
   */
  registerTemplate,

  /**
   * @name hasPermission
   * @method
   * @memberof Core
   * @summary server permissions checks hasPermission exists on both the server and the client.
   * @param {String | Array} checkPermissions -String or Array of permissions if empty, defaults to "admin, owner"
   * @param {String} userId - userId, defaults to Meteor.userId()
   * @param {String} checkGroup group - default to shopId
   * @return {Boolean} Boolean - true if has permission
   */
  hasPermission(checkPermissions, userId = Meteor.userId(), checkGroup = this.getShopId()) {
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
   * @return {Boolean} Boolean - true if has permission
   */
  hasOwnerAccess() {
    return this.hasPermission(["owner"]);
  },

  /**
   * @name hasAdminAccess
   * @method
   * @memberof Core
   * @return {Boolean} Boolean - true if has permission
   */
  hasAdminAccess() {
    return this.hasPermission(["owner", "admin"]);
  },

  /**
   * @name hasDashboardAccess
   * @method
   * @memberof Core
   * @return {Boolean} Boolean - true if has permission
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
   * @param  {string} [userId=Meteor.userId()] Optional userId, defaults to Meteor.userId()
   *                                           Must pass this.userId from publications to avoid error!
   * @return {array} Array of shopIds that the user has at least one of the given set of roles for
   */
  getShopsWithRoles(roles, userId = Meteor.userId()) {
    // Owner permission for a shop superceeds grantable permissions, so we always check for owner permissions as well
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
   * @return {String} Shop ID
   */
  getSellerShopId() {
    return Roles.getGroupsForUser(this.userId, "admin");
  },

  /**
   * @name configureMailUrl
   * @method
   * @memberof Core
   * @summary Reaction.configureMailUrl() is deprecated. Please use Reaction.Email.getMailUrl() instead
   * @return {String} URL
   * @deprecated
   */
  configureMailUrl() {
    // maintained for legacy support
    Logger.warn("Reaction.configureMailUrl() is deprecated. Please use Reaction.Email.getMailUrl() instead");
    return getMailUrl();
  },

  /**
   * @name getPrimaryShop
   * @summary Get the first created shop. In marketplace, the Primary Shop is the shop that controls the marketplace
   * and can see all other shops
   * @method
   * @memberof Core
   * @return {Object} Shop
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
   * @return {String} ID
   */
  getPrimaryShopId() {
    const primaryShop = this.getPrimaryShop();
    if (primaryShop) {
      return primaryShop._id;
    }
  },

  /**
   * @name getPrimaryShopName
   * @method
   * @summary Get primary shop name or empty string
   * @memberof Core
   * @return {String} Return shop name or empty string
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
   * @return {String} Prefix in the format of "/<slug>"
   */
  getPrimaryShopPrefix() {
    return `/${this.getSlug(this.getPrimaryShopName().toLowerCase())}`;
  },

  /**
   * @name getPrimaryShopSettings
   * @method
   * @memberof Core
   * @summary Get primary shop settings object
   * @return {Object} Get settings object or empty object
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
   * @memberof Core
   * @summary Get primary shop currency string
   * @return {String} Get shop currency or "USD"
   */
  getPrimaryShopCurrency() {
    const primaryShop = this.getPrimaryShop();

    if (primaryShop && primaryShop.currency) {
      return primaryShop.currency;
    }

    return "USD";
  },

  /**
   * @summary **DEPRECATED** This method has been deprecated in favor of using getShopId
   * and getPrimaryShopId. To be removed.
   * @deprecated
   * @memberof Core
   * @method getCurrentShopCursor
   * @return {Cursor} cursor of shops that match the current domain
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
   * @return {Object} returns the first shop object from the shop cursor
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
   * @return {String} active shop ID
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
      shopId = this.getUserShopId(Meteor.userId());
    } catch (e) {
      // `Meteor.userId` will raise an error when invoked outside of a method
      // call or publication, i.e., at startup. That's ok here.
    }

    // if still not found, look up the shop by domain
    if (!shopId) {
      shopId = this.getShopIdByDomain();
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
   */
  resetShopId() {
    ConnectionDataStore.clear("shopId");
  },

  /**
   * @name getShopIdByDomain
   * @method
   * @memberof Core
   * @summary returns the shop which should be used given the current domain
   */
  getShopIdByDomain() {
    const domain = this.getDomain();
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
   * @todo This should intelligently find the correct default shop Probably whatever the main shop is or marketplace
   * @return {StringId}        active shop ID
   */
  getUserShopId(userId) {
    check(userId, String);

    return this.getUserPreferences({
      userId,
      packageName: "reaction",
      preference: "activeShopId"
    });
  },

  /**
   * @name getDomain
   * @method
   * @memberof Core
   * @summary Get shop domain for URL
   * @return {String} Shop domain
   */
  getDomain() {
    return url.parse(Meteor.absoluteUrl()).hostname;
  },

  /**
   * @name getShopName
   * @method
   * @memberof Core
   * @summary If we can't find the shop or shop name return an empty string
   * @return {String} Shop name or empty string ""
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
   * @name getShopPrefix
   * @method
   * @memberof Core
   * @summary Get shop prefix for URL
   * @return {String} String in the format of "/shop/slug"
   */
  getShopPrefix() {
    const shopName = this.getShopName();
    const lowerCaseShopName = shopName.toLowerCase();
    const slug = this.getSlug(lowerCaseShopName);
    const marketplace = Packages.findOne({
      name: "reaction-marketplace",
      shopId: this.getPrimaryShopId()
    });

    if (marketplace && marketplace.settings && marketplace.settings.public) {
      return `${marketplace.settings.public.shopPrefix}/${slug}`;
    }
    return `/${slug}`;
  },

  /**
   * @name getShopEmail
   * @method
   * @memberof Core
   * @summary Get shop email
   * @return {String} String with the first store email
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
   * @return {Object}               Shop settings object or empty object
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
   * @return {String} Shop currency or "USD"
   */
  getShopCurrency() {
    const shop = Shops.findOne({
      _id: this.getShopId()
    });

    return (shop && shop.currency) || "USD";
  },

  /**
   * @name getShopLanguage
   * @method
   * @memberof Core
   * @todo TODO: Marketplace - should each shop set their own default language or
   * should the Marketplace set a language that's picked up by all shops?
   * @return {String} language
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
   * @return {Object|null}      Package setting object or null
   */
  getPackageSettings(name) {
    return Packages.findOne({ name, shopId: this.getShopId() }) || null;
  },

  /**
   * @summary Takes options in the form of a query object. Returns a package that matches.
   * @method
   * @memberof Core
   * @name getPackageSettingsWithOptions
   * @param  {object} options Options object, forms the query for Packages.findOne
   * @return {object} Returns the first package found with the provided options
   */
  getPackageSettingsWithOptions(options) {
    const query = options;
    return Packages.findOne(query);
  },

  /**
   * @name getMarketplaceSettings
   * @method
   * @memberof Core
   * @summary finds the enabled `reaction-marketplace` package for
   * the primary shop and returns the settings
   * @return {Object} The marketplace settings from the primary shop or undefined
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
   * @name getUserPreferences
   * @method
   * @memberof Core
   * @param  {Object} options {packageName, preference, defaultValue}
   * @return {String|undefined} User's package preference or undefined
   */
  getUserPreferences(options) {
    const { userId, packageName, preference, defaultValue } = options;

    if (!userId) {
      return undefined;
    }

    const user = AccountsCollection.findOne({ _id: userId });

    if (user) {
      const { profile } = user;
      if (profile && profile.preferences && profile.preferences[packageName] && profile.preferences[packageName][preference]) {
        return profile.preferences[packageName][preference];
      }
    }
    return defaultValue || undefined;
  },

  /**
   * @name setUserPreferences
   * @method
   * @summary save user preferences in the Accounts collection
   * @param {String} packageName
   * @param {String} preference
   * @param {String} value
   * @param {String} userId
   * @return {Number} setPreferenceResult
   */
  setUserPreferences(packageName, preference, value, userId) {
    const setPreferenceResult = AccountsCollection.update(userId, {
      $set: {
        [`profile.preferences.${packageName}.${preference}`]: value
      }
    });
    return setPreferenceResult;
  },
  /**
   *  @name insertPackagesForShop
   *  @method
   *  @memberof Core
   *  @summary insert Reaction packages into Packages collection registry for a new shop
   *  Assigns owner roles for new packages
   *  Imports layouts from packages
   *  @param {String} shopId - the shopId to create packages for
   *  @return {String} returns insert result
   */
  insertPackagesForShop(shopId) {
    const layouts = [];
    if (!shopId) {
      return [];
    }

    // Check to see what packages should be enabled
    const shop = Shops.findOne({ _id: shopId });
    const marketplaceSettings = this.getMarketplaceSettings();
    let enabledPackages;

    // Unless we have marketplace settings and an enabledPackagesByShopTypes Array
    // we will skip this
    if (marketplaceSettings &&
        marketplaceSettings.shops &&
        Array.isArray(marketplaceSettings.shops.enabledPackagesByShopTypes)) {
      // Find the correct packages list for this shopType
      const matchingShopType = marketplaceSettings.shops.enabledPackagesByShopTypes.find((EnabledPackagesByShopType) => EnabledPackagesByShopType.shopType === shop.shopType); // eslint-disable-line max-len
      if (matchingShopType) {
        ({ enabledPackages } = matchingShopType);
      }
    }

    const packages = this.Packages;
    // for each shop, we're loading packages in a unique registry
    // Object.keys(pkgConfigs).forEach((pkgName) => {
    for (const packageName in packages) {
      // Guard to prvent unexpected `for in` behavior
      if ({}.hasOwnProperty.call(packages, packageName)) {
        const config = packages[packageName];
        this.assignOwnerRoles(shopId, packageName, config.registry);

        const pkg = Object.assign({}, config, {
          shopId
        });

        // populate array of layouts that don't already exist (?!)
        if (pkg.layout) {
          // filter out layout templates
          for (const template of pkg.layout) {
            if (template && template.layout) {
              layouts.push(template);
            }
          }
        }

        if (enabledPackages && Array.isArray(enabledPackages)) {
          if (enabledPackages.indexOf(pkg.name) === -1) {
            pkg.enabled = false;
          } else if (pkg.settings && pkg.settings[packageName]) { // Enable "soft switch" for package.
            pkg.settings[packageName].enabled = true;
          }
        }
        Packages.insert(pkg);
        Logger.debug(`Initializing ${shopId} ${packageName}`);
      }
    }

    // helper for removing layout duplicates
    const uniqLayouts = uniqWith(layouts, _.isEqual);
    Shops.update({ _id: shopId }, { $set: { layout: uniqLayouts } });
  },

  /**
   * @name getAppVersion
   * @method
   * @memberof Core
   * @return {String} App version
   */
  getAppVersion() {
    return Shops.findOne().appVersion;
  },

  /**
   * @name createDefaultAdminUser
   * @method
   * @memberof Core
   * @summary Method that creates default admin user
   * Settings load precendence:
   *  1. environment variables
   *  2. settings in meteor.settings
   * @returns {String} return userId
   */
  createDefaultAdminUser() {
    const shopId = this.getPrimaryShopId();
    if (!shopId) {
      throw new Error(`createDefaultAdminUser: getPrimaryShopId returned ${shopId}`);
    }

    // if an admin user has already been created, we'll exit
    if (Roles.getUsersInRole("owner", shopId).count() !== 0) {
      Logger.debug("Not creating default admin user, already exists");
      return ""; // this default admin has already been created for this shop.
    }

    // run hooks on options object before creating user (the options object must be returned from all callbacks)
    let options = {};
    options = Hooks.Events.run("beforeCreateDefaultAdminUser", options);

    // If $REACTION_SECURE_DEFAULT_ADMIN is set to "true" on first run,
    // a random email/password will be generated instead of using the
    // default email and password (email: admin@localhost pw: r3@cti0n)
    // and the new admin user will need to verify their email to log in.
    // If a random email and password are generated, the console will be
    // the only place to retrieve them.
    // If the admin email/password is provided via environment or Meteor settings,
    // the $REACTION_SECURE_DEFAULT_ADMIN will only enforce the email validation part.
    const isSecureSetup = process.env.REACTION_SECURE_DEFAULT_ADMIN === "true";

    // generate default values to use if none are supplied
    const defaultEmail = isSecureSetup ? `${Random.id(8).toLowerCase()}@localhost` : "admin@localhost";
    const defaultPassword = isSecureSetup ? Random.secret(8) : "r3@cti0n";
    const defaultUsername = "admin";
    const defaultName = "Admin";

    // Process environment variables and Meteor settings for initial user config.
    // If ENV variables are set, they always override Meteor settings (settings.json).
    // This is to allow for testing environments where we don't want to use users configured in a settings file.
    const { env } = process;
    let configureEnv = false;

    if (env.REACTION_EMAIL && env.REACTION_AUTH) {
      configureEnv = true;
      Logger.info("Using environment variables to create admin user");
    }

    // defaults use either env or generated values
    options.email = env.REACTION_EMAIL || defaultEmail;
    options.password = env.REACTION_AUTH || defaultPassword;
    options.username = env.REACTION_USER_NAME || defaultUsername;
    options.name = env.REACTION_USER || defaultName;

    // or use `meteor --settings`
    if (Meteor.settings && !configureEnv) {
      if (Meteor.settings.reaction) {
        options.email = Meteor.settings.reaction.REACTION_EMAIL || defaultEmail;
        options.password = Meteor.settings.reaction.REACTION_AUTH || defaultPassword;
        options.username = Meteor.settings.reaction.REACTION_USER || defaultUsername;
        options.name = Meteor.settings.reaction.REACTION_USER_NAME || defaultName;
        Logger.info("Using meteor --settings to create admin user");
      }
    }

    // set the default shop email to the default admin email
    Shops.update(shopId, {
      $addToSet: {
        emails: {
          address: options.email,
          verified: true
        }
      }
    });

    // get the current shop
    const shop = Shops.findOne(shopId);

    // add the current domain to the shop if it doesn't already exist
    if (!shop.domains.includes(this.getDomain())) {
      // set the default shop email to the default admin email
      Shops.update(shopId, {
        $addToSet: {
          domains: this.getDomain()
        }
      });
    }

    //
    // create the new admin user
    //
    let accountId;
    // we're checking again to see if this user was created but not specifically for this shop.
    if (Meteor.users.find({ "emails.address": options.email }).count() === 0) {
      accountId = Accounts.createUser(options);
    } else {
      // this should only occur when existing admin creates a new shop
      accountId = Meteor.users.findOne({ "emails.address": options.email })._id;
    }

    // update the user's name if it was provided
    // (since Accounts.createUser() doesn't allow that field and strips it out)
    Meteor.users.update(accountId, {
      $set: {
        name: options.name
      }
    });

    // unless strict security is enabled, mark the admin's email as validated
    if (!isSecureSetup) {
      Meteor.users.update({
        "_id": accountId,
        "emails.address": options.email
      }, {
        $set: {
          "emails.$.verified": true
        }
      });
      Collections.Accounts.update({
        "_id": accountId,
        "emails.address": options.email
      }, {
        $set: {
          "emails.$.verified": true
        }
      });
    } else {
      // send verification email to admin
      sendVerificationEmail(accountId);
    }

    // Set default owner roles
    const defaultAdminRoles = ["owner", "admin", "guest", "account/profile"];
    // Join other roles with defaultAdminRoles for owner.
    // this is needed as owner should not just have "owner" but all other defined roles
    let ownerRoles = defaultAdminRoles.concat(this.defaultCustomerRoles);
    ownerRoles = _.uniq(ownerRoles);

    // we don't use accounts/addUserPermissions here because we may not yet have permissions
    Roles.setUserRoles(accountId, ownerRoles, shopId);
    // // the reaction owner has permissions to all sites by default
    Roles.setUserRoles(accountId, ownerRoles, Roles.GLOBAL_GROUP);
    // initialize package permissions we don't need to do any further permission configuration it is taken care of in the
    // assignOwnerRoles
    const packages = Packages.find().fetch();
    for (const pkg of packages) {
      this.assignOwnerRoles(shopId, pkg.name, pkg.registry);
    }

    // notify user that the default admin was created by
    // printing the account info to the console
    Logger.warn(`\n *********************************
        \n  IMPORTANT! DEFAULT ADMIN INFO
        \n  EMAIL/LOGIN: ${options.email}
        \n  PASSWORD: ${options.password}
        \n ********************************* \n\n`);

    // run hooks on new user object
    const user = Meteor.users.findOne(accountId);
    Hooks.Events.run("afterCreateDefaultAdminUser", user);

    return accountId;
  },

  /**
   *  @name loadPackages
   *  @method
   *  @memberof Core
   *  @summary Insert Reaction packages into registry
   *  we check to see if the number of packages have changed against current data
   *  if there is a change, we'll either insert or upsert package registry
   *  into the Packages collection
   *  import is processed on hook in init()
   *  @return {String} returns insert result
   */
  loadPackages() {
    const packages = Packages.find().fetch();

    let registryFixtureData;

    if (process.env.REACTION_REGISTRY) {
      // check the environment for the registry fixture data first
      registryFixtureData = process.env.REACTION_REGISTRY;
      Logger.info("Loaded REACTION_REGISTRY environment variable for registry fixture import");
    } else {
      // or attempt to load reaction.json fixture data
      try {
        registryFixtureData = Assets.getText("settings/reaction.json");
        Logger.info("Loaded \"/private/settings/reaction.json\" for registry fixture import");
      } catch (error) {
        Logger.warn("Skipped loading settings from reaction.json.");
        Logger.debug(error, "loadSettings reaction.json not loaded.");
      }
    }

    if (registryFixtureData) {
      const validatedJson = EJSON.parse(registryFixtureData);

      if (!Array.isArray(validatedJson[0])) {
        Logger.warn("Registry fixture data is not an array. Failed to load.");
      } else {
        registryFixtureData = validatedJson;
      }
    }

    const layouts = [];
    // for each shop, we're loading packages in a unique registry
    _.each(this.Packages, (config, pkgName) =>
      Shops.find().forEach((shop) => {
        const shopId = shop._id;
        if (!shopId) return [];

        // existing registry will be upserted with changes, perhaps we should add:
        this.assignOwnerRoles(shopId, pkgName, config.registry);

        // Settings from the package registry.js
        const settingsFromPackage = {
          name: pkgName,
          icon: config.icon,
          enabled: !!config.autoEnable,
          settings: config.settings,
          registry: config.registry,
          layout: config.layout
        };

        // Setting from a fixture file, most likely reaction.json
        let settingsFromFixture;
        if (registryFixtureData) {
          settingsFromFixture = registryFixtureData[0].find((packageSetting) => config.name === packageSetting.name);
        }

        // Setting already imported into the packages collection
        const settingsFromDB = packages.find((ps) => (config.name === ps.name && shopId === ps.shopId));

        const combinedSettings = merge({}, settingsFromPackage, settingsFromFixture || {}, settingsFromDB || {});

        if (combinedSettings.registry) {
          combinedSettings.registry = combinedSettings.registry.map((entry) => {
            if (entry.provides && !Array.isArray(entry.provides)) {
              entry.provides = [entry.provides];
              Logger.warn(`Plugin ${combinedSettings.name} is using a deprecated version of the provides property for` +
                          ` the ${entry.name || entry.route} registry entry. Since v1.5.0 registry provides accepts` +
                          " an array of strings.");
            }
            return entry;
          });
        }

        // populate array of layouts that don't already exist in Shops
        if (combinedSettings.layout) {
          // filter out layout Templates
          for (const pkg of combinedSettings.layout) {
            if (pkg.layout) {
              layouts.push(pkg);
            }
          }
        }
        // Import package data
        this.Importer.package(combinedSettings, shopId);
        return Logger.debug(`Initializing ${shop.name} ${pkgName}`);
      }));

    // helper for removing layout duplicates
    const uniqLayouts = uniqWith(layouts, _.isEqual);
    // import layouts into Shops
    Shops.find().forEach((shop) => {
      this.Importer.layout(uniqLayouts, shop._id);
    });

    //
    // package cleanup
    //
    Shops.find().forEach((shop) => Packages.find().forEach((pkg) => {
      // delete registry entries for packages that have been removed
      if (!_.has(this.Packages, pkg.name)) {
        Logger.debug(`Removing ${pkg.name}`);
        return Packages.remove({ shopId: shop._id, name: pkg.name });
      }
      return false;
    }));
  },

  /**
   * @name setAppVersion
   * @method
   * @memberof Core
   * @return {undefined} no return value
   */
  setAppVersion() {
    const { version } = packageJson;
    Logger.info(`Reaction Version: ${version}`);
    Shops.update({}, { $set: { appVersion: version } }, { multi: true });
  },

  /**
   * @summary Method for getting all schemas attached to a given collection
   * @deprecated by simpl-schema
   * @private
   * @name collectionSchema
   * @param  {string} collection The mongo collection to get schemas for
   * @param  {Object} [selector] Optional selector for multi schema collections
   * @return {Object} Returns a simpleSchema that is a combination of all schemas
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
      // Return false so we don't pass a check that uses a non-existant schema
      return false;
    }

    const schema = col.simpleSchema(selector);
    if (!schema) {
      Logger.warn(errMsg);
      // Return false so we don't pass a check that uses a non-existant schema
      return false;
    }

    return schema;
  }
};
