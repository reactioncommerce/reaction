/*
 * Fixtures is a global server object that it can be reused in packages
 * assumes collection data in reaction-core/private/data, optionally jsonFile
 * use jsonFile when calling from another package, as we can't read the assets from here
 */

/* eslint no-loop-func: 0*/

PackageFixture = class PackageFixture {
  /**
   * PackageFixture.loadData
   * @summary imports collection fixture data
   * @param {Object} collection - The collection to import
   * @param {String} jsonFile - path to json File.
   * @return {Boolean} boolean -  returns true on insert
   */
  loadData(collection, jsonFile) {
    check(collection, Mongo.Collection);
    check(jsonFile, Match.Optional(String));

    // prevent import if existing collection data
    if (collection.find().count() > 0) {
      return false;
    }

    let json = null;
    let result = null;

    ReactionCore.Log.debug(
      `Loading fixture data for ${collection._name}`);
    // if jsonFile was path wasn't provided
    // we'll assume we're loading collection data
    if (!jsonFile) {
      json = EJSON.parse(Assets.getText("private/data/" + collection._name +
        ".json"));
    } else {
      json = EJSON.parse(jsonFile);
    }

    // loop over each item in json and insert into collection
    for (let item of json) {
      try {
        result = collection.insert(item);
      } catch (err) {
        ReactionCore.Log.error("Error adding fixture data to " +
          collection._name + ":", err.message);
      }
    }

    if (result) {
      ReactionCore.Log.info(
        `Success importing fixture data to ${collection._name}`
      );
    }
  }

  /**
   * PackageFixture.loadSettings
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
   *  Fixtures.loadSettings Assets.getText("settings/reaction.json")
   */
  loadSettings(json) {
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
  }

  /**
   * loadI18n fixtures
   * @summary imports translation fixture data
   * @param {Object} translationCollection - optional collection object
   * @returns {null} inserts collection
   */
  loadI18n(translationCollection) {
    let collection = translationCollection || ReactionCore.Collections.Translations;
    let json;

    if (collection.find().count() > 0) {
      return;
    }

    let shop = ReactionCore.Collections.Shops.findOne();
    if (shop) {
      ReactionCore.Log.info(
        `Loading fixture data for ${collection._name}`);
      if (!(shop !== null ? shop.languages : void 0)) {
        shop.languages = [{
          i18n: "en"
        }];
      }

      for (let language of shop.languages) {
        json = EJSON.parse(Assets.getText("private/data/i18n/" + language.i18n +
          ".json"));
        for (let item of json) {
          collection.insert(item, function (error) {
            if (error) {
              ReactionCore.Log.warn("Error adding " + language.i18n +
                " to " + collection._name, item, error);
            }
          });
          ReactionCore.Log.info("Success adding " + language.i18n +
            " to " +
            collection._name);
        }
      }
    } else {
      ReactionCore.Log.error("No shop found. Failed to load languages.");
      return;
    }
  }

  /**
   * @function loadCurrencyJobs
   * @summary Creates two jobs for fetching fresh and clearing old exchange rates
   */
  loadCurrencyJobs(jobsCollection) {
    const collection = jobsCollection || ReactionCore.Collections.Jobs;
    if (collection.find().count() > 0) {
      return;
    }

    const shopId = ReactionCore.getShopId();
    const shopSettings = ReactionCore.Collections.Packages.findOne({
      shopId: shopId,
      name: "core"
    }, {
      fields: {
        settings: 1
      }
    });
    const refreshPeriod = shopSettings.settings.openexchangerates.refreshPeriod;

    const fetchCurrencyRatesJob = new Job(Jobs, "shop/fetchCurrencyRates", {})
      .priority("normal")
      .retry({
        retries: 5,
        wait: 60000,
        backoff: 'exponential' // delay by twice as long for each subsequent retry
      })
      .repeat({
        // wait: refreshPeriod * 60 * 1000
        schedule: Jobs.later.parse.text(refreshPeriod)
      })
      .save({
        // Cancel any jobs of the same type,
        // but only if this job repeats forever.
        // Default: false.
        // We do not need this here anymore, because fixtures runs one time, but
        // let it be here anyway for some case...
        cancelRepeats: true
      });

    if (fetchCurrencyRatesJob) {
      ReactionCore.Log.info("Success adding new job for: 'shop/fetchCurrencyRates'");
    }

    const flushCurrencyRatesJob = new Job(Jobs, "shop/flushCurrencyRates", {})
      .priority("normal")
      .retry({
        retries: 5,
        wait: 60000,
        backoff: 'exponential'
      })
      .repeat({
        // wait: refreshPeriod * 60 * 1000
        schedule: Jobs.later.parse.text(refreshPeriod)
      })
      .save({
        cancelRepeats: true
      });

    if (flushCurrencyRatesJob) {
      ReactionCore.Log.info("Success adding new job for: 'shop/flushCurrencyRates'");
    }
  }
};

/*
 * instantiate fixtures
 */
this.Fixtures = new PackageFixture();

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
  options.email = process.env.REACTION_EMAIL || Random.id(8).toLowerCase() + "@" + domain;
  options.username = process.env.REACTION_USER || "Admin"; // username
  options.password = process.env.REACTION_AUTH || Random.secret(8);
  // but we can override with provided `meteor --settings`
  if (Meteor.settings) {
    if (Meteor.settings.reaction) {
      options.username = Meteor.settings.reaction.REACTION_USER || "Admin";
      options.password = Meteor.settings.reaction.REACTION_AUTH || Random.secret(8);
      options.email = Meteor.settings.reaction.REACTION_EMAIL || Random.id(8).toLowerCase() + "@" + domain;
      ReactionCore.Log.info("Using meteor --settings to create admin user");
    }
  }

  // create the new admin user
  // we're checking again to see if this user was created but not specifically for this shop.
  if (Meteor.users.find({"emails.address": options.email}).count() === 0) {
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
        "services.launchdock.url": process.env.LAUNCHDOCK_URL
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
  if (ReactionCore.Collections.Packages.find().count() !== ReactionCore.Collections
    .Shops.find().count() * Object.keys(ReactionRegistry.Packages).length) {
    // for each shop, we're loading packages registry
    _.each(ReactionRegistry.Packages, function (config, pkgName) {
      return ReactionCore.Collections.Shops.find().forEach(function (shop) {
        let shopId = shop._id;
        ReactionCore.Log.info("Initializing " + shop.name + " " +
          pkgName);
        // existing registry will be upserted with changes
        if (!shopId) return [];
        let result = ReactionCore.Collections.Packages.upsert({
          shopId: shopId,
          name: pkgName
        }, {
          $setOnInsert: {
            shopId: shopId,
            icon: config.icon,
            enabled: !!config.autoEnable,
            settings: config.settings,
            registry: config.registry,
            layout: config.layout
          }
        });
        return result;
      });
    });
  }
  // remove registry entries for packages that have been removed
  ReactionCore.Collections.Shops.find().forEach(function (shop) {
    return ReactionCore.Collections.Packages.find().forEach(function (pkg) {
      if (!_.has(ReactionRegistry.Packages, pkg.name)) {
        ReactionCore.Log.info(`Removing ${pkg.name}`, pkg);
        return ReactionCore.Collections.Packages.remove({
          shopId: shop._id,
          name: pkg.name
        });
      }
    });
  });
};

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
    Shops.update({
      domains: currentDomain
    }, {
      $set: {
        "domains.$": getDomain()
      }
    });
  }
};

/*
 * load core fixture data
 */

ReactionRegistry.loadFixtures = function () {
  Fixtures.loadData(ReactionCore.Collections.Shops);
  // start checking once per second if Shops collection is ready,
  // then load the rest of the fixtures when it is
  let wait = Meteor.setInterval(function () {
    if (!!ReactionCore.Collections.Shops.find().count()) {
      Meteor.clearInterval(wait);
      Fixtures.loadI18n(ReactionCore.Collections.Translations);
      Fixtures.loadData(ReactionCore.Collections.Products);
      Fixtures.loadData(ReactionCore.Collections.Tags);
      Fixtures.loadCurrencyJobs(ReactionCore.Collections.Jobs);
      // create default admin user
      ReactionRegistry.createDefaultAdminUser();
      // we've finished all reaction core initialization
      ReactionCore.Log.info("Reaction Core initialization finished.");
    }
  }, 1000);
  // load package configurations
  if (ReactionCore.Collections.Shops.find().count()) {
    ReactionRegistry.setDomain();
    ReactionRegistry.loadPackages();
  }
};
