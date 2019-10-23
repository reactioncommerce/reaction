import _ from "lodash";
import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Roles } from "meteor/alanning:roles";
import { Packages } from "/lib/collections";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import { translateRegistry } from "/lib/api";

const IDENTITY_PROVIDER_PLUGIN_NAME = "reaction-hydra-oauth";
const { IDENTITY_PROVIDER_MODE } = process.env;

/**
 * @method transform
 * @memberof Packages
 * @description For transforming packages before publication sets some defaults for the client and adds i18n while checking privileged settings for enabled status
 * @param {Object} doc Registry doc
 * @param {String} userId Id of user to check permissions for
 * @returns {Object} Registry doc with permissions
 */
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

        // Delete the route if the user doesn't have the correct permissions
        if (Roles.userIsInRole(userId, registry.permissions, doc.shopId) === false) {
          delete registry.route;
        }
      }

      // We no longer use a settingsKey for "enabled" for some registry types.
      // Would prefer to eliminate for all eventually.
      if (Array.isArray(registry.provides) && registry.provides.includes("paymentSettings")) {
        registry.enabled = !!doc.enabled;
      } else {
        if (doc.settings && doc.settings[registry.settingsKey]) {
          registry.enabled = !!doc.settings[registry.settingsKey].enabled;
        } else {
          registry.enabled = !!doc.enabled;
        }
        // define export settings
        registrySettings[registry.settingsKey] = {
          enabled: registry.enabled
        };
      }

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
  // TODO: Update when envalid is setup
  if (doc.name === IDENTITY_PROVIDER_PLUGIN_NAME) {
    doc.identityProviderMode = IDENTITY_PROVIDER_MODE;
  }

  return doc;
}

// eslint-disable-next-line consistent-return
Meteor.publish("Packages", function (shopId) {
  check(shopId, Match.Maybe(String));

  const self = this;
  let myShopId = shopId;

  if (!self.userId) return self.ready();

  if (!myShopId) {
    myShopId = Reaction.getPrimaryShopId();
    if (!myShopId) {
      return self.ready();
    }
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
      settings: 1,
      audience: 1
    }
  };

  // if admin user, return all shop properties
  if (
    Roles.userIsInRole(self.userId, ["dashboard", "owner", "admin"], myShopId) ||
    Roles.userIsInRole(self.userId, ["owner", "admin"], Roles.GLOBAL_GROUP)
  ) {
    options = {};
  }

  const query = { shopId: myShopId };

  // This is to ensure only needed Identity-provider-related routes are published
  // The env can be one of three: "all", "idp-only", "exclude-idp". Default behavior is "all"
  if (IDENTITY_PROVIDER_MODE === "idp-only") {
    query.name = IDENTITY_PROVIDER_PLUGIN_NAME;
  } else if (IDENTITY_PROVIDER_MODE === "exclude-idp") {
    query.name = { $ne: IDENTITY_PROVIDER_PLUGIN_NAME };
  }

  // observe and transform Package registry adds i18n and other meta data
  const observer = Packages.find(query, options).observe({
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

  return self.ready();
});
