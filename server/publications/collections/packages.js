import _ from "lodash";
import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Roles } from "meteor/alanning:roles";
import { Packages } from "/lib/collections";
import { Reaction } from "/server/api";
import { translateRegistry } from "/lib/api";

/**
 * Packages contains user specific configuration
 * @summary  package publication settings, filtered by permissions
 * @param {Object} shopCursor - current shop object
 * @returns {Object} packagesCursor - current packages for shop
 */

// for transforming packages before publication sets some defaults for the client and adds i18n while checking
// privileged settings for enabled status.
function transform(doc, userId) {
  const registrySettings = {};
  const packageSettings = {};
  let permissions = ["admin", "owner", doc.name];

  // Get all permissions, add them to an array
  if (doc.registry && doc.registry.permissions) {
    for (const item of doc.registry.permissions) {
      permissions.push(item.permission);
    }
  }
  permissions = _.uniq(permissions);

  // check for admin,owner or package permissions to view settings
  const hasAdmin = Roles.userIsInRole(userId, permissions, doc.shopId);

  if (doc.registry) {
    for (let registry of doc.registry) {
      // add some normalized defaults
      registry.packageId = doc._id;
      registry.shopId = doc.shopId;
      registry.packageName = registry.packageName || doc.name;
      [registry.settingsKey] = (registry.name || doc.name).split("/").splice(-1);
      // check and set package enabled state
      registry.permissions = [...permissions];
      if (registry.route) {
        registry.permissions.push(registry.name || `${doc.name}/${registry.template}`);
      }
      if (doc.settings && doc.settings[registry.settingsKey]) {
        registry.enabled = !!doc.settings[registry.settingsKey].enabled;
      } else {
        registry.enabled = !!doc.enabled;
      }
      // define export settings
      registrySettings[registry.settingsKey] = {
        enabled: registry.enabled
      };

      // add i18n keys
      registry = translateRegistry(registry, doc);
    }
  }
  // admin users get all settings the intent of this it so block publication of settings without limiting the use settings
  // in this transform. non admin users should get public setting
  if (hasAdmin === false && doc.settings) {
    registrySettings.public = doc.settings.public;
    delete doc.settings;
    Object.assign(packageSettings, registrySettings);
    doc.settings = packageSettings;
  }

  return doc;
}

//
//  Packages Publication
//
Meteor.publish("Packages", function (shopId) {
  check(shopId, Match.Maybe(String));

  const self = this;
  let myShopId = shopId;

  // user is required.
  if (self.userId) {
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
        settings: 1,
        audience: 1
      }
    };

    if (!shopId) {
      myShopId = Reaction.getPrimaryShopId();
    }

    // we should always have a shop
    if (myShopId) {
      // if admin user, return all shop properties
      if (Roles.userIsInRole(self.userId, [
        "dashboard", "owner", "admin"
      ], Reaction.getShopId() || Roles.userIsInRole(self.userId, [
        "owner", "admin"
      ], Roles.GLOBAL_GROUP))) {
        options = {};
      }
      // observe and transform Package registry adds i18n and other meta data
      const observer = Packages.find({
        shopId: myShopId
      }, options).observe({
        added(doc) {
          self.added("Packages", doc._id, transform(doc, self.userId));
        },
        changed(newDoc, origDoc) {
          self.changed("Packages", origDoc._id, transform(newDoc, self.userId));
        },
        removed(origDoc) {
          self.removed("Packages", origDoc._id);
        }
      });

      self.onStop(() => {
        observer.stop();
      });
    }
    return self.ready();
  }
});
