import {Packages} from "/lib/collections";
import {Reaction, Logger} from "/server/api";
import {translateRegistry} from "/lib/api";
import {Roles} from "meteor/alanning:roles";

/**
 * Packages contains user specific configuration
 * @summary  package publication settings, filtered by permissions
 * @param {Object} shopCursor - current shop object
 * @returns {Object} packagesCursor - current packages for shop
 */

// for transforming packages before publication sets some defaults for the client and adds i18n while checking
// priviledged settings for enabled status.
function transform(doc) {
  const hasAdmin = Roles.userIsInRole(this.userId, ["admin", "owner"]);
  const publicSettings = [];

  if (doc.registry) {
    for (registry of doc.registry) {
      // add some normalized defaults
      registry.packageId = doc._id;
      registry.packageName = registry.packageName || doc.name;
      // registry.icon = registry.icon || doc.icon;
      registry.settingsKey = (registry.name || doc.name).split("/").splice(-1)[0];
      // add i18n keys
      registry = translateRegistry(registry, doc);
      // set package enabled to settings.enabled status
      if (doc.settings && doc.settings[registry.settingsKey]) {
        registry.enabled = doc.settings[registry.settingsKey].enabled;
        Logger.debug(`Set enabled ${registry.settingsKey} as ${registry.enabled}`);
        if (registry.enabled === true && hasAdmin) {
          publicSettings.push({
            [registry.settingsKey]: {
              enabled: true
            }
          });
        }
      }
    }
  }
  // admin users get all settings
  // the intent of this it so block publication
  // of settings without limiting the use
  // settings in this transform.
  // non admin users should get public settings
  if (hasAdmin === false && doc.settings) {
    const pub = doc.settings.public || {};
    delete doc.settings;
    doc.settings = {
      public: pub,
      publicSettings
    };
  }
  Logger.debug(`Transforming and publishing ${doc.name} as ${doc.enabled}`);
  return doc;
}

//
//  Packages Publication
//
Meteor.publish("Packages", function (shopCursor) {
  check(shopCursor, Match.Optional(Object));
  const self = this;
  const shop = shopCursor || Reaction.getCurrentShop();

  // user is required.
  if (this.userId === null) {
    return this.ready();
  }

  // default options, we're limiting fields here that we don't want to publish unless admin user. in particular, settings
  // should not be published but we need to use settings in the transform everything except settings.public and
  // settings.*.enabled are removed in transform
  let options = {
    fields: {
      shopId: 1,
      name: 1,
      enabled: 1,
      registry: 1,
      layout: 1,
      icon: 1,
      settings: 1
    },
    sort: {
      "priority": 1,
      "registry.priority": 1
    }
  };

  // we should always have a shop
  if (shop) {
    // if admin user, return all shop properties
    if (Roles.userIsInRole(this.userId, [
      "dashboard", "owner", "admin"
    ], Reaction.getShopId() || Roles.userIsInRole(this.userId, [
      "owner", "admin"
    ], Roles.GLOBAL_GROUP))) {
      options = {};
    }
    // observe and transform Package registry adds i18n and other meta data
    const observer = Packages.find({
      shopId: shop._id
    }, options).observe({
      added: function (doc) {
        self.added("Packages", doc._id, transform(doc));
      },
      changed: function (newDoc, origDoc) {
        self.changed("Packages", origDoc._id, transform(newDoc));
      },
      removed: function (origDoc) {
        self.removed("Packages", origDoc._id);
      }
    });

    self.onStop(function () {
      observer.stop();
    });
  }

  return self.ready();
});
