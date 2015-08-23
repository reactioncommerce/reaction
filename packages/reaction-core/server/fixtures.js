/*
 * Fixtures is a global server object that it can be reused in packages
 * assumes collection data in reaction-core/private/data, optionally jsonFile
 * use jsonFile when calling from another package, as we can't read the assets from here
 */


var PackageFixture, getDomain;

PackageFixture = function() {
  return {
    loadData: function(collection, jsonFile) {
      var index, item, json, _i, _len;
      check(jsonFile, Match.Optional(String));
      if (collection.find().count() > 0) {
        return;
      }
      ReactionCore.Events.info("Loading default data for " + collection._name);
      if (!jsonFile) {
        json = EJSON.parse(Assets.getText("private/data/" + collection._name + ".json"));
      } else {
        json = EJSON.parse(jsonFile);
      }
      for (index = _i = 0, _len = json.length; _i < _len; index = ++_i) {
        item = json[index];
        collection.insert(item, function(error, result) {
          if (error) {
            ReactionCore.Events.error("Error adding document " + index + " to " + collection._name);
            return false;
          }
        });
      }
      if (index > 0) {
        ReactionCore.Events.info("Success adding document " + index + " items to " + collection._name);
      } else {
        ReactionCore.Events.info("No documents imported to " + collection._name);
      }
    },

    /*
     * updates package settings, accepts json string
     * example:
     *  Fixtures.loadSettings Assets.getText("settings/reaction.json")
     *
     * This basically allows you to "hardcode" all the settings. You can change them
     * via admin etc for the session, but when the server restarts they'll
     * be restored back to the supplied json
     *
     * All settings are private unless added to `settings.public`
     *
     * Meteor account services can be added in `settings.services`
     */
    loadSettings: function(json) {
      var exists, item, pkg, result, service, services, settings, validatedJson, _i, _j, _k, _len, _len1, _len2, _ref;
      check(json, String);
      validatedJson = EJSON.parse(json);
      if (!_.isArray(validatedJson[0])) {
        ReactionCore.Events.warn("Load Settings is not an array. Failed to load settings.");
        return;
      }
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
                  ReactionCore.Events.info("service configuration loaded: " + item.name + " | " + service);
                }
              }
            }
            ReactionCore.Events.info("loaded local package data: " + item.name);
          }
        }
      }
    },
    loadI18n: function(collection) {
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
          json = EJSON.parse(Assets.getText("private/data/i18n/" + language.i18n + ".json"));
          for (_j = 0, _len1 = json.length; _j < _len1; _j++) {
            item = json[_j];
            collection.insert(item, function(error, result) {
              if (error) {
                ReactionCore.Events.warn("Error adding " + language.i18n + " to " + collection._name, item, error);
              }
            });
            ReactionCore.Events.info("Success adding " + language.i18n + " to " + collection._name);
          }
        }
      } else {
        return ReactionCore.Events.error("No shop found. Failed to load languages.");
      }
    }
  };
};


/*
 * instantiate fixtures
 */

this.Fixtures = new PackageFixture;


/*
 * local helper for creating admin users
 */

getDomain = function(url) {
  var domain;
  if (!url) {
    url = process.env.ROOT_URL;
  }
  domain = url.match(/^https?\:\/\/([^\/:?#]+)(?:[\/:?#]|$)/i)[1];
  return domain;
};


/*
 * Method that creates default admin user
 */

ReactionRegistry.createDefaultAdminUser = function() {
  var accountId, defaultAdminRoles, domain, options, packages, pkg, reg, shopId, url, _i, _j, _len, _len1, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6;
  options = {};
  options.email = process.env.METEOR_EMAIL;
  options.username = process.env.METEOR_USER;
  options.password = process.env.METEOR_AUTH;
  domain = getDomain();
  defaultAdminRoles = ['owner', 'admin'];
  shopId = ReactionCore.getShopId();
  if (Roles.getUsersInRole(defaultAdminRoles, shopId).count() !== 0) {
    return;
  }
  if (process.env.METEOR_EMAIL) {
    url = process.env.MONGO_URL;
    options.username = "Owner";
    if (!options.password) {
      options.password = url.substring(url.indexOf("/") + 2, url.indexOf("@")).split(":")[1];
    }
    ReactionCore.Events.warn("\nIMPORTANT! DEFAULT USER INFO (ENV)\n  EMAIL/LOGIN: " + options.email + "\n  PASSWORD: " + options.password + "\n");
  } else {
    options.username = ((_ref = Meteor.settings) != null ? (_ref1 = _ref.reaction) != null ? _ref1.METEOR_USER : void 0 : void 0) || "Owner";
    options.password = ((_ref2 = Meteor.settings) != null ? (_ref3 = _ref2.reaction) != null ? _ref3.METEOR_AUTH : void 0 : void 0) || Random.secret(8);
    options.email = ((_ref4 = Meteor.settings) != null ? (_ref5 = _ref4.reaction) != null ? _ref5.METEOR_EMAIL : void 0 : void 0) || Random.id(8).toLowerCase() + "@" + domain;
    ReactionCore.Events.warn("\nIMPORTANT! DEFAULT USER INFO (RANDOM)\n  EMAIL/LOGIN: " + options.email + "\n  PASSWORD: " + options.password + "\n");
  }

  accountId = Accounts.createUser(options);

  packages = ReactionCore.Collections.Packages.find().fetch();

  ReactionCore.Collections.Shops.update(shopId, {
    $addToSet: {
      emails: {
        'address': options.email,
        'verified': true
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

  Meteor.call("addUserPermissions", accountId, _.uniq(defaultAdminRoles), shopId);
  Meteor.call("addUserPermissions", accountId, ['owner', 'admin', 'dashboard'], Roles.GLOBAL_GROUP);
};


/*
 * load core fixture data
 */

ReactionRegistry.loadFixtures = function() {
  var currentDomain, e;
  Fixtures.loadData(ReactionCore.Collections.Shops);
  Fixtures.loadData(ReactionCore.Collections.Products);
  Fixtures.loadData(ReactionCore.Collections.Tags);
  Fixtures.loadI18n(ReactionCore.Collections.Translations);
  try {
    currentDomain = ReactionCore.Collections.Shops.findOne().domains[0];
  } catch (_error) {
    e = _error;
    ReactionCore.Events.error("Failed to determine default shop.", e);
  }
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
  if (ReactionCore.Collections.Packages.find().count() !== ReactionCore.Collections.Shops.find().count() * Object.keys(ReactionRegistry.Packages).length) {
    _.each(ReactionRegistry.Packages, function(config, pkgName) {
      return ReactionCore.Collections.Shops.find().forEach(function(shop) {
        ReactionCore.Events.info("Initializing " + pkgName);
        return ReactionCore.Collections.Packages.upsert({
          shopId: shop._id,
          name: pkgName
        }, {
          $setOnInsert: {
            shopId: shop._id,
            enabled: !!config.autoEnable,
            settings: config.settings,
            registry: config.registry
          }
        });
      });
    });
  }
  ReactionCore.Collections.Shops.find().forEach(function(shop) {
    return ReactionCore.Collections.Packages.find().forEach(function(pkg) {
      if (!_.has(ReactionRegistry.Packages, pkg.name)) {
        ReactionCore.Events.info("Removing " + pkg.name);
        return ReactionCore.Collections.Packages.remove({
          shopId: shop._id,
          name: pkg.name
        });
      }
    });
  });
  ReactionRegistry.createDefaultAdminUser();
};
