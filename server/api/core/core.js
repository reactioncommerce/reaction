import url from "url";
import { merge, uniqWith } from "lodash";
import { Meteor } from "meteor/meteor";
import { EJSON } from "meteor/ejson";
import { Jobs, Packages, Shops } from "/lib/collections";
import { Hooks, Logger } from "/server/api";
import ProcessJobs from "/server/jobs";
import { getRegistryDomain } from "./setDomain";
import { sendVerificationEmail } from "./accounts";
import { getMailUrl } from "./email/config";

export default {

  init() {
    // run onCoreInit hooks
    Hooks.Events.run("onCoreInit", this);
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
    this.Import.flush();
    // timing is important, packages are rqd
    // for initilial permissions configuration.
    this.createDefaultAdminUser();
    // hook after init finished
    Hooks.Events.run("afterCoreInit");

    Logger.info("Reaction.init() has run");

    return true;
  },

  Packages: {},

  registerPackage(packageInfo) {
    const registeredPackage = this.Packages[packageInfo.name] =
      packageInfo;
    return registeredPackage;
  },

  /**
   * hasPermission - server
   * server permissions checks
   * hasPermission exists on both the server and the client.
   * @param {String | Array} checkPermissions -String or Array of permissions if empty, defaults to "admin, owner"
   * @param {String} userId - userId, defaults to Meteor.userId()
   * @param {String} checkGroup group - default to shopId
   * @return {Boolean} Boolean - true if has permission
   */
  hasPermission(checkPermissions, userId = Meteor.userId(), checkGroup = this.getShopId()) {
    // check(checkPermissions, Match.OneOf(String, Array));
    // check(userId, String);
    // check(checkGroup, Match.Optional(String));

    let permissions;
    // default group to the shop or global if shop
    // isn't defined for some reason.
    if (checkGroup !== undefined && typeof checkGroup === "string") {
      group = checkGroup;
    } else {
      group = this.getShopId() || Roles.GLOBAL_GROUP;
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

    // return if user has permissions in the group
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
  },

  hasOwnerAccess() {
    return this.hasPermission(["owner"]);
  },

  hasAdminAccess() {
    return this.hasPermission(["owner", "admin"]);
  },

  hasDashboardAccess() {
    return this.hasPermission(["owner", "admin", "dashboard"]);
  },

  getSellerShopId() {
    return Roles.getGroupsForUser(this.userId, "admin");
  },

  configureMailUrl() {
    // maintained for legacy support
    Logger.warn(
      "Reaction.configureMailUrl() is deprecated. Please use Reaction.Email.getMailUrl() instead"
    );
    return getMailUrl();
  },

  getCurrentShopCursor() {
    const domain = this.getDomain();
    const cursor = Shops.find({
      domains: domain
    }, {
      limit: 1
    });
    if (!cursor.count()) {
      Logger.debug(domain, "Add a domain entry to shops for ");
    }
    return cursor;
  },

  getCurrentShop() {
    const currentShopCursor = this.getCurrentShopCursor();
    // also, we could check in such a way: `currentShopCursor instanceof Object`
    // but not instanceof something.Cursor
    if (typeof currentShopCursor === "object") {
      return currentShopCursor.fetch()[0];
    }
    return null;
  },

  getShopId() {
    const domain = this.getDomain();
    const shop = Shops.find({ domains: domain }, {
      limit: 1,
      fields: { _id: 1 }
    }).fetch()[0];
    return shop && shop._id;
  },

  getDomain() {
    return url.parse(Meteor.absoluteUrl()).hostname;
  },

  getShopName() {
    const domain = this.getDomain();
    const shop = Shops.find({ domains: domain }, {
      limit: 1,
      fields: { name: 1 }
    }).fetch()[0];
    return shop && shop.name;
  },

  getShopEmail() {
    const shop = Shops.find({ _id: this.getShopId() }, {
      limit: 1,
      fields: { emails: 1 }
    }).fetch()[0];
    return shop && shop.emails && shop.emails[0].address;
  },

  getShopSettings() {
    const settings = Packages.findOne({
      name: "core",
      shopId: this.getShopId()
    }) || {};
    return settings.settings || {};
  },

  getPackageSettings(name) {
    return Packages.findOne({ name, shopId: this.getShopId() }) || null;
  },

  /**
   * createDefaultAdminUser
   * @summary Method that creates default admin user
   * Settings load precendence:
   *  1. settings in meteor.settings
   *  2. environment variables
   * @returns {String} return userId
   */
  createDefaultAdminUser() {
    Logger.info("Starting createDefaultAdminUser");
    const domain = getRegistryDomain();
    const env = process.env;
    const defaultAdminRoles = ["owner", "admin", "guest", "account/profile"];
    let options = {};
    let configureEnv = false;
    let accountId;

    while (!this.getShopId()) {
      Logger.info("No shopId, waiting one second...");
      Meteor._sleepForMs(1000);
    }
    const shopId = this.getShopId();

    // if an admin user has already been created, we'll exit
    if (Roles.getUsersInRole(defaultAdminRoles, shopId).count() !== 0) {
      Logger.info("Not creating default admin user, already exists");
      return ""; // this default admin has already been created for this shop.
    }

    // run hooks on options object before creating user
    // (the options object must be returned from all callbacks)
    options = Hooks.Events.run("beforeCreateDefaultAdminUser", options);

    //
    // process Meteor settings and env variables for initial user config
    // if ENV variables are set, these always override "settings.json"
    // this is to allow for testing environments. where we don't want to use
    // users configured in a settings file.
    //
    if (env.REACTION_EMAIL && env.REACTION_USER && env.REACTION_AUTH) {
      configureEnv = true;
    }

    // defaults use either env or generated
    options.email = env.REACTION_EMAIL || Random.id(8).toLowerCase() +
      "@" + domain;
    options.username = env.REACTION_USER || "Admin"; // username
    options.password = env.REACTION_AUTH || Random.secret(8);

    // but we can override with provided `meteor --settings`
    if (Meteor.settings && !configureEnv) {
      if (Meteor.settings.reaction) {
        options.username = Meteor.settings.reaction.REACTION_USER || "Admin";
        options.password = Meteor.settings.reaction.REACTION_AUTH || Random.secret(
          8);
        options.email = Meteor.settings.reaction.REACTION_EMAIL || Random.id(8)
          .toLowerCase() + "@" + domain;
        Logger.info("Using meteor --settings to create admin user");
      }
    }

    // set the default shop email to the default admin email
    Shops.update(shopId, {
      $addToSet: {
        emails: {
          address: options.email,
          verified: true
        },
        domains: Meteor.settings.ROOT_URL
      }
    });

    //
    // create the new admin user
    //

    // we're checking again to see if this user was created but not specifically for this shop.
    if (Meteor.users.find({
      "emails.address": options.email
    }).count() === 0) {
      accountId = Accounts.createUser(options);
    } else {
      // this should only occur when existing admin creates a new shop
      accountId = Meteor.users.findOne({
        "emails.address": options.email
      })._id;
    }

    //
    // send verification email
    //

    // we dont need to validate admin user in development
    if (process.env.NODE_ENV === "development") {
      Meteor.users.update({
        "_id": accountId,
        "emails.address": options.email
      }, {
        $set: {
          "emails.$.verified": true
        }
      });
    } else { // send verification email to admin
      try {
        // if server is not configured. Error in configuration
        // are caught, but admin isn't verified.
        sendVerificationEmail(accountId);
      } catch (error) {
        Logger.warn(error, "Unable to send admin account verification email.");
      }
    }

    //
    // Set Default Roles
    //

    // we don't use accounts/addUserPermissions here because we may not yet have permissions
    Roles.setUserRoles(accountId, _.uniq(defaultAdminRoles), shopId);
    // // the reaction owner has permissions to all sites by default
    Roles.setUserRoles(accountId, _.uniq(defaultAdminRoles), Roles.GLOBAL_GROUP);
    // initialize package permissions
    // we don't need to do any further permission configuration
    // it is taken care of in the assignOwnerRoles
    const packages = Packages.find().fetch();
    for (const pkg of packages) {
      this.assignOwnerRoles(shopId, pkg.name, pkg.registry);
    }

    //
    //  notify user that admin was created account email should print on console
    //

    Logger.warn(
      `\n *********************************
        \n  IMPORTANT! DEFAULT ADMIN INFO
        \n  EMAIL/LOGIN: ${options.email}
        \n  PASSWORD: ${options.password}
        \n ********************************* \n\n`
    );

    // run hooks on new user object
    const user = Meteor.users.findOne(accountId);
    Hooks.Events.run("afterCreateDefaultAdminUser", user);
    return accountId;
  },

  /**
   *  loadPackages
   *  insert Reaction packages into registry
   *  we check to see if the number of packages have changed against current data
   *  if there is a change, we'll either insert or upsert package registry
   *  into the Packages collection
   *  import is processed on hook in init()
   *  @return {String} returns insert result
   */
  loadPackages() {
    const packages = Packages.find().fetch();

    let settingsFromJSON;

    // Attempt to load reaction.json fixture data
    try {
      const settingsJSONAsset = Assets.getText("settings/reaction.json");
      const validatedJson = EJSON.parse(settingsJSONAsset);

      if (!_.isArray(validatedJson[0])) {
        Logger.warn("Load Settings is not an array. Failed to load settings.");
      } else {
        settingsFromJSON = validatedJson;
      }
    } catch (error) {
      Logger.warn("Skipped loading settings from reaction.json.");
      Logger.debug(error, "loadSettings reaction.json not loaded.");
    }
    const layouts = [];
    // for each shop, we're loading packages in a unique registry
    _.each(this.Packages, (config, pkgName) => {
      return Shops.find().forEach((shop) => {
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
        if (settingsFromJSON) {
          settingsFromFixture = _.find(settingsFromJSON[0], (packageSetting) => {
            return config.name === packageSetting.name;
          });
        }

        // Setting already imported into the packages collection
        const settingsFromDB = _.find(packages, (ps) => {
          return (config.name === ps.name && shopId === ps.shopId);
        });

        const combinedSettings = merge({},
          settingsFromPackage,
          settingsFromFixture || {},
          settingsFromDB || {}
        );

        // populate array of layouts that
        // don't already exist in Shops
        if (combinedSettings.layout) {
          // filter out layout Templates
          for (const pkg of combinedSettings.layout) {
            if (pkg.layout) {
              layouts.push(pkg);
            }
          }
        }
        // Import package data
        this.Import.package(combinedSettings, shopId);
        return Logger.debug(`Initializing ${shop.name} ${pkgName}`);
      }); // end shops
    });

    // helper for removing layout duplicates
    const uniqLayouts = uniqWith(layouts, _.isEqual);
    // import layouts into Shops
    Shops.find().forEach((shop) => {
      this.Import.layout(uniqLayouts, shop._id);
    });

    //
    // package cleanup
    //
    Shops.find().forEach((shop) => {
      return Packages.find().forEach((pkg) => {
        // delete registry entries for packages that have been removed
        if (!_.has(this.Packages, pkg.name)) {
          Logger.debug(`Removing ${pkg.name}`);
          return Packages.remove({
            shopId: shop._id,
            name: pkg.name
          });
        }
        return false;
      });
    });
  }
};
