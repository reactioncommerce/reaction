/*
 * ReactionRegistry is a global server object that it can be reused in packages
 * assumes collection data in reaction-core/private/data, optionally jsonFile
 * use jsonFile when calling from another package, as we can't read the assets from here
 */

/**
 * getDomain
 * local helper for creating admin users
 * @param {String} requestUrl - url
 * @return {String} domain name stripped from requestUrl
 */
function getDomain(requestUrl) {
  let url = requestUrl || process.env.ROOT_URL;
  let domain = url.match(/^https?\:\/\/([^\/:?#]+)(?:[\/:?#]|$)/i)[1];
  return domain;
}
/**
 * ReactionRegistry.loadSettings
 * @description
 * This basically allows you to "hardcode" all the settings. You can change them
 * via admin etc for the session, but when the server restarts they'll
 * be restored back to the supplied json
 *
 * All settings are private unless added to `settings.public`
 *
 * Meteor account services can be added in `settings.services`
 * @summary updates package settings, accepts json string
 * @param {Object} json - json object to insert
 * @return {Boolean} boolean -  returns true on insert
 * @example
 *  ReactionRegistry.loadSettings Assets.getText("settings/reaction.json")
 */
ReactionRegistry.loadSettings = function (json) {
  check(json, String);
  let exists;
  let service;
  let services;
  let settings;
  let validatedJson = EJSON.parse(json);
  // validate json and error out if not an array
  if (!_.isArray(validatedJson[0])) {
    ReactionCore.Log.warn(
      "Load Settings is not an array. Failed to load settings.");
    return;
  }
  // loop settings and upsert packages.
  for (let pkg of validatedJson) {
    for (let item of pkg) {
      exists = ReactionCore.Collections.Packages.findOne({
        name: item.name
      });
      // insert into the Packages collection
      if (exists) {
        result = ReactionCore.Collections.Packages.upsert({
          name: item.name
        }, {
          $set: {
            settings: item.settings,
            enabled: item.enabled
          }
        }, {
          multi: true,
          upsert: true,
          validate: false
        });
      }
      // sets the private settings of various
      // accounts authentication services
      if (item.settings.services) {
        for (services of item.settings.services) {
          for (service in services) {
            // this is just a sanity check required by linter
            if ({}.hasOwnProperty.call(services, service)) {
              // actual settings for the service
              settings = services[service];
              ServiceConfiguration.configurations.upsert({
                service: service
              }, {
                $set: settings
              });
              ReactionCore.Log.info("service configuration loaded: " +
                item.name + " | " + service);
            }
          }
        }
      }
      ReactionCore.Log.info(`loaded local package data: ${item.name}`);
    }
  }
};

/**
 * ReactionRegistry createDefaultAdminUser
 * @summary Method that creates default admin user
 * Settings load precendence:
 *  1. settings in meteor.settings
 *  2. environment variables
 * @returns {String} return userId
 */
ReactionRegistry.createDefaultAdminUser = function () {
  const options = {};
  const domain = getDomain();
  const defaultAdminRoles = ["owner", "admin", "guest"];
  const shopId = ReactionCore.getShopId();
  let accountId; //
  // if an admin user has already been created, we'll exit
  if (Roles.getUsersInRole(defaultAdminRoles, shopId).count() !== 0) {
    return; // this default admin has already been created for this shop.
  }
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
      ReactionCore.Log.info("Using meteor --settings to create admin user");
    }
  }

  // create the new admin user
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
      ReactionCore.Log.warn(
        "Unable to send admin account verification email.", error);
    }
  }
  // launchdock is the Reaction PaaS solution
  // if we have launchdock credentials, we'll configure them
  if (process.env.LAUNCHDOCK_USERID) {
    Meteor.users.update({
      _id: accountId
    }, {
      $set: {
        "services.launchdock.userId": process.env.LAUNCHDOCK_USERID,
        "services.launchdock.username": process.env.LAUNCHDOCK_USERNAME,
        "services.launchdock.auth": process.env.LAUNCHDOCK_AUTH,
        "services.launchdock.url": process.env.LAUNCHDOCK_URL,
        "services.launchdock.stackId": process.env.LAUNCHDOCK_STACK_ID
      }
    });
  }
  // set the defaut shop email to the default admin email
  ReactionCore.Collections.Shops.update(shopId, {
    $addToSet: {
      emails: {
        address: options.email,
        verified: true
      },
      domains: Meteor.settings.ROOT_URL
    }
  });
  // populate roles with all the packages and their permissions
  // this way the default user has all permissions
  const packages = ReactionCore.Collections.Packages.find().fetch();
  for (let pkg of packages) {
    for (let reg of pkg.registry) {
      if (reg.route) {
        defaultAdminRoles.push(reg.route);
      }
      if (reg.name) {
        defaultAdminRoles.push(reg.name);
      }
    }
    defaultAdminRoles.push(pkg.name);
  }
  // we don't use accounts/addUserPermissions here because we may not yet have permissions
  Roles.setUserRoles(accountId, _.uniq(defaultAdminRoles), shopId);
  // the reaction owner has permissions to all sites by default
  Roles.setUserRoles(accountId, _.uniq(defaultAdminRoles), Roles.GLOBAL_GROUP);
  // notify user that admin was created
  // account email should print on console
  ReactionCore.Log.warn(
    `\n *********************************
      \n  IMPORTANT! DEFAULT ADMIN INFO
      \n  EMAIL/LOGIN: ${options.email}
      \n  PASSWORD: ${options.password}
      \n ********************************* \n\n`
  );
};

/**
 *  ReactionRegistry.loadPackages
 *  insert Reaction packages into registry
 *  we check to see if the number of packages have changed against current data
 *  if there is a change, we'll either insert or upsert package registry
 *  into the Packages collection
 *  @see: https://github.com/reactioncommerce/reaction/blob/development/docs/developer/packages.md
 *  @return {String} returns insert result
 */
ReactionRegistry.loadPackages = function () {
  const shopCount = ReactionCore.Collections.Shops.find().count();
  const regCount = Object.keys(ReactionRegistry.Packages).length;
  const pkgCount = ReactionCore.Collections.Packages.find().count();
  // checking the package count to see if registry has changed
  if (pkgCount !== shopCount * regCount) {
    // for each shop, we're loading packages a unique registry
    _.each(ReactionRegistry.Packages, function (config, pkgName) {
      return ReactionCore.Collections.Shops.find().forEach(function (
        shop) {
        let shopId = shop._id;
        ReactionCore.Log.info("Initializing " + shop.name + " " +
          pkgName);
        // existing registry will be upserted with changes
        if (!shopId) return [];
        ReactionImport.package({
          name: pkgName,
          icon: config.icon,
          enabled: !!config.autoEnable,
          settings: config.settings,
          registry: config.registry,
          layout: config.layout
        }, shopId);
      });
    });
    ReactionImport.flush();

    // package cleanup
    ReactionCore.Collections.Shops.find().forEach(function (shop) {
      return ReactionCore.Collections.Packages.find().forEach(function (
        pkg) {
        // remove registry entries for packages that have been removed
        if (!_.has(ReactionRegistry.Packages, pkg.name)) {
          ReactionCore.Log.info(`Removing ${pkg.name}`);
          return ReactionCore.Collections.Packages.remove({
            shopId: shop._id,
            name: pkg.name
          });
        }
      });
    });
  }
};

/**
 *  @private ReactionRegistry.setDomain
 *  @summary update the default shop url if ROOT_URL supplied is different from current
 *  @return {String} returns insert result
 */
ReactionRegistry.setDomain = function () {
  let currentDomain;
  // we automatically update the shop domain when ROOT_URL changes
  try {
    currentDomain = ReactionCore.Collections.Shops.findOne().domains[0];
  } catch (_error) {
    ReactionCore.Log.error("Failed to determine default shop.", _error);
  }
  // if the server domain changes, update shop
  if (currentDomain && currentDomain !== getDomain()) {
    ReactionCore.Log.info("Updating domain to " + getDomain());
    ReactionCore.Collections.Shops.update({
      domains: currentDomain
    }, {
      $set: {
        "domains.$": getDomain()
      }
    });
  }
};

/**
 *  ReactionRegistry.setShopName
 *  @private ReactionRegistry.setShopName
 *  @params {Object} shop - shop
 *  @summary when new shop is created, set shop name if REACTION_SHOP_NAME env var exists
 *  @returns {undefined} undefined
 */
ReactionRegistry.setShopName = function (shop) {
  const Shops = ReactionCore.Collections.Shops;
  const shopName = process.env.REACTION_SHOP_NAME;

  if (shopName) {
    // if this shop name has already been used, don't use it again
    if (!!ReactionCore.Collections.Shops.findOne({ name: shopName })) {
      ReactionCore.Log.info(`Default shop name ${shopName} already used`);
    } else {
      // update the shop name with the REACTION_SHOP_NAME env var
      try {
        Shops.update({ _id: shop._id }, { $set: { name: shopName } });
      } catch (err) {
        ReactionCore.Log.error("Failed to update shop name", err);
      }
    }
  }
};


ReactionCore.Collections.Shops.find().observe({
  added(doc) {
    ReactionRegistry.setShopName(doc);
    ReactionRegistry.setDomain();
    ReactionRegistry.createDefaultAdminUser();
  },
  removed(doc) {
    // TODO SHOP REMOVAL CLEANUP FOR #357
  }
});
