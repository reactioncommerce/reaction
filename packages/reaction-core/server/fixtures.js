/*
 * Fixtures is a global server object that it can be reused in packages
 * assumes collection data in reaction-core/private/data, optionally jsonFile
 * use jsonFile when calling from another package, as we can't read the assets from here
 */

/* eslint no-loop-func: 0*/

let getDomain;

PackageFixture = class {
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

    ReactionCore.Events.info(`Loading default data for ${collection._name}`);
    // if jsonFile was path wasn't provided
    // we'll assume we're loading collection data
    if (!jsonFile) {
      json = EJSON.parse(Assets.getText("private/data/" + collection._name +
        ".json"));
    } else {
      json = EJSON.parse(jsonFile);
    }

    // loop over each item in json and import insert into collection
    for (let item of json) {
      result = collection.insert(item);
    }

    if (result) {
      ReactionCore.Events.info(
        `Success importing document to ${collection._name}`
      );
    } else {
      ReactionCore.Events.error("Error adding document to " +
        collection._name, error.message);
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
    check(json, Object);
    var exists, item, pkg, result, service, services, settings, _i, _j, _k,
      _len, _len1, _len2, _ref;
    var validatedJson = EJSON.parse(json);

    if (!_.isArray(validatedJson[0])) {
      ReactionCore.Events.warn(
        "Load Settings is not an array. Failed to load settings.");
      return;
    }
    // loop settings and upsert packages.
    for (_i = 0, _len = validatedJson.length; _i < _len; _i++) {
      pkg = validatedJson[_i];
      for (_j = 0, _len1 = pkg.length; _j < _len1; _j++) {
        item = pkg[_j];
        exists = ReactionCore.Collections.Packages.findOne({
          'name': item.name
        });
        if (exists) {
          result = ReactionCore.Collections.Packages.upsert({
            'name': item.name
          }, {
            $set: {
              'settings': item.settings,
              'enabled': item.enabled
            }
          }, {
            multi: true,
            upsert: true,
            validate: false
          });
          if (item.settings.services) {
            _ref = item.settings.services;
            for (_k = 0, _len2 = _ref.length; _k < _len2; _k++) {
              services = _ref[_k];
              for (service in services) {
                settings = services[service];
                ServiceConfiguration.configurations.upsert({
                  service: service
                }, {
                  $set: settings
                });
                ReactionCore.Events.info("service configuration loaded: " +
                  item.name + " | " + service);
              }
            }
          }
          ReactionCore.Events.info("loaded local package data: " + item.name);
        }
      }
    }
  }

  /**
   * loadI18n fixtures
   * @summary imports translation fixture data
   */
  loadI18n(collection) {
    var item, json, language, languages, shop, _i, _j, _len, _len1, _ref;
    if (collection == null) {
      collection = ReactionCore.Collections.Translations;
    }
    languages = [];
    if (collection.find().count() > 0) {
      return;
    }
    shop = ReactionCore.Collections.Shops.findOne();
    if (shop) {
      ReactionCore.Events.info("Loading fixture data for " + collection._name);
      if (!(shop != null ? shop.languages : void 0)) {
        shop.languages = [{
          'i18n': 'en'
        }];
      }
      _ref = shop.languages;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        language = _ref[_i];
        json = EJSON.parse(Assets.getText("private/data/i18n/" + language.i18n +
          ".json"));
        for (_j = 0, _len1 = json.length; _j < _len1; _j++) {
          item = json[_j];
          collection.insert(item, function (error, result) {
            if (error) {
              ReactionCore.Events.warn("Error adding " + language.i18n +
                " to " + collection._name, item, error);
            }
          });
          ReactionCore.Events.info("Success adding " + language.i18n +
            " to " +
            collection._name);
        }
      }
    } else {
      return ReactionCore.Events.error(
        "No shop found. Failed to load languages.");
    }
  }
};

/*
 * instantiate fixtures
 */
this.Fixtures = new PackageFixture();

/*
 * local helper for creating admin users
 */

getDomain = function (url) {
  var domain;
  if (!url) {
    url = process.env.ROOT_URL;
  }
  domain = url.match(/^https?\:\/\/([^\/:?#]+)(?:[\/:?#]|$)/i)[1];
  return domain;
};

/**
 * ReactionRegistry createDefaultAdminUser
 * @summary Method that creates default admin user
 */

ReactionRegistry.createDefaultAdminUser = function () {
  var accountId, defaultAdminRoles, domain, options, packages, pkg, reg,
    shopId, url, _i, _j, _len, _len1, _ref, _ref1, _ref2, _ref3, _ref4, _ref5,
    _ref6;
  options = {};
  options.email = process.env.REACTION_EMAIL;
  options.username = process.env.REACTION_USER;
  options.password = process.env.REACTION_AUTH;
  domain = getDomain();
  defaultAdminRoles = ["owner", "admin"];
  shopId = ReactionCore.getShopId();
  if (Roles.getUsersInRole(defaultAdminRoles, shopId).count() !== 0) {
    return;
  }
  if (process.env.REACTION_EMAIL) {
    url = process.env.MONGO_URL;
    options.username = "Owner";
    if (!options.password) {
      options.password = url.substring(url.indexOf("/") + 2, url.indexOf("@"))
        .split(":")[1];
    }
    ReactionCore.Events.warn(
      "\nIMPORTANT! DEFAULT USER INFO (ENV)\n  EMAIL/LOGIN: " + options.email +
      "\n  PASSWORD: " + options.password + "\n");
  } else {
    options.username = ((_ref = Meteor.settings) != null ? (_ref1 = _ref.reaction) !=
      null ? _ref1.REACTION_USER : void 0 : void 0) || "Owner";
    options.password = ((_ref2 = Meteor.settings) != null ? (_ref3 = _ref2.reaction) !=
      null ? _ref3.REACTION_AUTH : void 0 : void 0) || Random.secret(8);
    options.email = ((_ref4 = Meteor.settings) != null ? (_ref5 = _ref4.reaction) !=
        null ? _ref5.REACTION_EMAIL : void 0 : void 0) || Random.id(8).toLowerCase() +
      "@" + domain;
    ReactionCore.Events.warn(
      "\nIMPORTANT! DEFAULT USER INFO (RANDOM)\n  EMAIL/LOGIN: " + options.email +
      "\n  PASSWORD: " + options.password + "\n");
  }

  accountId = Accounts.createUser(options);

  // account email should print on console
  // if server is not confgured. Error in configuration
  // are caught, but admin isn't verified.
  try {
    Accounts.sendVerificationEmail(accountId);
  } catch (_error) {
    ReactionCore.Events.warn(
      "Unable to send admin account verification email.", error);
  }

  // configure Launchdock auth
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

  packages = ReactionCore.Collections.Packages.find().fetch();

  ReactionCore.Collections.Shops.update(shopId, {
    $addToSet: {
      emails: {
        address: options.email,
        verified: true
      },
      domains: Meteor.settings.ROOT_URL
    }
  });

  for (_i = 0, _len = packages.length; _i < _len; _i++) {
    pkg = packages[_i];
    _ref6 = pkg.registry;
    for (_j = 0, _len1 = _ref6.length; _j < _len1; _j++) {
      reg = _ref6[_j];
      if (reg.route) {
        defaultAdminRoles.push(reg.route);
      }
      if (reg.name) {
        defaultAdminRoles.push(reg.name);
      }
    }
    defaultAdminRoles.push(pkg.name);
  }

  Meteor.call("addUserPermissions", accountId, _.uniq(defaultAdminRoles),
    shopId);
  Meteor.call("addUserPermissions", accountId, ["owner", "admin", "dashboard"],
    Roles.GLOBAL_GROUP);
};

/*
 * load core fixture data
 */

ReactionRegistry.loadFixtures = function () {
  let currentDomain;

  Fixtures.loadData(ReactionCore.Collections.Shops);
  Fixtures.loadData(ReactionCore.Collections.Products);
  Fixtures.loadData(ReactionCore.Collections.Tags);
  Fixtures.loadI18n(ReactionCore.Collections.Translations);

  try {
    currentDomain = ReactionCore.Collections.Shops.findOne().domains[0];
  } catch (_error) {
    ReactionCore.Events.error("Failed to determine default shop.", _error);
  }

  // if the server domain changes, update shop
  if (currentDomain && currentDomain !== getDomain()) {
    ReactionCore.Events.info("Updating domain to " + getDomain());
    Shops.update({
      domains: currentDomain
    }, {
      $set: {
        "domains.$": getDomain()
      }
    });
  }
  //  insert packages into registry
  //  we check to see if the number of packages have changed against current data
  //  if there is a change, we'll either insert or upsert package registry
  //  into the Packages collection
  if (ReactionCore.Collections.Packages.find().count() !== ReactionCore.Collections
    .Shops.find().count() * Object.keys(ReactionRegistry.Packages).length) {
    // for each shop, we're loading packages registry
    _.each(ReactionRegistry.Packages, function (config, pkgName) {
      return ReactionCore.Collections.Shops.find().forEach(function (
        shop) {
        let shopId = shop._id;
        ReactionCore.Events.info("Initializing " + shop.name + " " +
          pkgName);
        // existing registry will be upserted with changes
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
        ReactionCore.Events.info("Removing " + pkg.name);
        return ReactionCore.Collections.Packages.remove({
          shopId: shop._id,
          name: pkg.name
        });
      }
    });
  });
  // create default admin user
  ReactionRegistry.createDefaultAdminUser();
};
