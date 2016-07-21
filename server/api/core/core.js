import url from "url";
import { merge, uniqWith } from "lodash";
import { Meteor } from "meteor/meteor";
import { EJSON } from "meteor/ejson";
import { Jobs, Packages, Shops } from "/lib/collections";
import { Hooks, Logger } from "/server/api";
import { getRegistryDomain } from "./setDomain";

export default {

  init() {
    // run onCoreInit hooks
    Hooks.Events.run("onCoreInit", this);
    // start job server
    Jobs.startJobServer(() => {
      Logger.info("JobServer started");
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
    Hooks.Events.run("afterCoreInit", this);

    Logger.info("Reaction.init() has run");

    return true;
  },

  Packages: {},

  registerPackage(packageInfo) {
    let registeredPackage = this.Packages[packageInfo.name] =
      packageInfo;
    return registeredPackage;
  },

  /**
   * hasPermission - server
   * server permissions checks
   * hasPermission exists on both the server and the client.
   * @param {String | Array} checkPermissions -String or Array of permissions if empty, defaults to "admin, owner"
   * @param {String} checkUserId - userId, defaults to Meteor.userId()
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

  configureMailUrl(user, password, host, port) {
    const shopSettings = Packages.findOne({
      shopId: this.getShopId(),
      name: "core"
    });

    let shopMail;

    if (shopSettings) {
      shopMail = shopSettings.settings.mail || {};
    }

    let processUrl = process.env.MAIL_URL;
    let settingsUrl = Meteor.settings.MAIL_URL;

    if (user && password && host && port) {
      let mailString = `smtp://${user}:${password}@${host}:${port}/`;
      const mailUrl = processUrl = settingsUrl = mailString;
      process.env.MAIL_URL = mailUrl;
      return mailUrl;
    } else if (shopMail && shopMail.user && shopMail.password && shopMail.host &&
      shopMail.port) {
      let mailString =
        `smtp://${shopMail.user}:${shopMail.password}@${shopMail.host}:${shopMail.port}/`;
      const mailUrl = processUrl = settingsUrl = mailString;
      process.env.MAIL_URL = mailUrl;

      Logger.info(`setting default mail url to: ${shopMail.host}`);
      return mailUrl;
    } else if (settingsUrl && !processUrl) {
      const mailUrl = processUrl = settingsUrl;
      process.env.MAIL_URL = mailUrl;
      return mailUrl;
    }
    // return reasonable warning that we're not configured correctly
    if (!process.env.MAIL_URL) {
      Logger.warn("Mail server not configured. Unable to send email.");
      return false;
    }
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
    let options = {};
    const domain = getRegistryDomain();
    const defaultAdminRoles = ["owner", "admin", "guest", "account/profile"];
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
    //

    // defaults use either env or generated
    options.email = process.env.REACTION_EMAIL || Random.id(8).toLowerCase() +
      "@" + domain;
    options.username = process.env.REACTION_USER || "Admin"; // username
    options.password = process.env.REACTION_AUTH || Random.secret(8);
    // but we can override with provided `meteor --settings`
    if (Meteor.settings) {
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
        // if server is not confgured. Error in configuration
        // are caught, but admin isn't verified.
        Accounts.sendVerificationEmail(accountId);
      } catch (error) {
        Logger.warn(
          "Unable to send admin account verification email.", error);
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
    for (let pkg of packages) {
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
    let layouts = [];
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
          for (let pkg of combinedSettings.layout) {
            if (pkg.layout) {
              layouts.push(pkg);
            }
          }
        }
        // Import package data
        this.Import.package(combinedSettings, shopId);
        Logger.info(`Initializing ${shop.name} ${pkgName}`);
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
          Logger.info(`Removing ${pkg.name}`);
          return Packages.remove({
            shopId: shop._id,
            name: pkg.name
          });
        }
      });
    });
  }
};
