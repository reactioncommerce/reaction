import url from "url";
import { slugify } from "transliteration";
import { Meteor } from "meteor/meteor";
import { Router } from "/imports/plugins/core/router/lib";
import { Shops } from "/lib/collections";

/**
 * @file Various helper methods
 *
 * @namespace Helpers
 */

let Core;
if (Meteor.isClient) {
  Core = require("/client/api");
} else {
  Core = require("/server/api");
}

/**
 * @name getShopId
 * @method
 * @memberof Helpers
 * @return {String} returns current shopId
 */
export function getShopId() {
  return Core.Reaction.getShopId();
}

/**
 * @name getPrimaryShopId
 * @method
 * @memberof Helpers
 * @return {String} returns primary shopId
 */
export function getPrimaryShopId() {
  return Core.Reaction.getPrimaryShopId();
}

/**
 * getShopSettings
 * @return {Object} returns current shop settings
 */
export function getShopSettings() {
  return Core.Reaction.getShopSettings();
}

/**
 * @name getShopName
 * @method
 * @memberof Helpers
 * @return {String} returns current shop name
 */
export function getShopName() {
  const shopId = getShopId();
  let shop;
  if (shopId) {
    shop = Shops.findOne({
      _id: shopId
    });
    return shop && shop.name || "";
  }

  const domain = url.parse(Meteor.absoluteUrl()).hostname;

  shop = Shops.find({ domains: { $in: [domain] } }, {
    limit: 1
  }).fetch()[0];

  return !!shop ? shop.name : "";
}

/**
 * @name getShopPrefix
 * @method
 * @memberof Helpers
 * @param {String} leading - Default "/", prefix, the prefix with a leading shash
 * @return {String} returns shop url prefix
 */
export function getShopPrefix(leading = "/") {
  const shopId = getShopId();

  if (shopId) {
    const shop = Shops.findOne({
      _id: shopId
    }, {
      fields: {
        _id: 1,
        name: 1,
        shopType: 1
      }
    });

    const settings = Core.Reaction.getMarketplaceSettings();
    const slug = leading + getSlug(shop.slug || getShopName().toLowerCase());

    if (shop.shopType === "primary") {
      // If naked routes is turned off, use the shop slug for our primary shop routes
      if (settings && settings.marketplaceNakedRoutes === false) {
        return slug;
      }

      return "";
    }

    // If this is not the primary shop, use the shop slug in routes for this shop
    // TODO: "/shop" should be configurable in marketplace settings
    return "/shop" + slug;
  }

  return "";
}

/**
 * @name getAbsoluteUrl
 * @method
 * @memberof Helpers
 * @param {String} path - path to append to absolute Url, path should be prefixed with / if necessary
 * @return {String} returns absolute url (shop prefix + path)
 */
export function getAbsoluteUrl(path) {
  const prefix = getShopPrefix("");
  if (prefix) {
    const absUrl = Meteor.absoluteUrl(`${prefix}/${path}`);
    return absUrl;
  }
  const absUrl = Meteor.absoluteUrl(`${path}`);
  return absUrl;
}

/**
 * @name getCurrentTag
 * @method
 * @memberof Helpers
 * @return {String} returns current tag
 */
export function getCurrentTag() {
  if (Router.getRouteName() === "tag") {
    return Router.current().params.slug;
  }
  return null;
}

/**
 * @name getSlug
 * @method
 * @memberof Helpers
 * @summary return a slugified string using "slugify" from transliteration
 * https://www.npmjs.com/package/transliteration
 * @param  {String} slugString - string to slugify
 * @return {String} slugified string
 */
export function getSlug(slugString) {
  return slugString ? slugify(slugString) : "";
}

/**
 * @name toCamelCase
 * @method
 * @memberof Helpers
 * @summary helper for i18n - special toCamelCase for converting a string to camelCase for use with i18n keys
 * @param {String} needscamels String to be camel cased.
 * @return {String} camelCased string
 */
export function toCamelCase(needscamels) {
  let s;
  s = needscamels.replace(/([^a-zA-Z0-9_\- ])|^[_0-9]+/g, "").trim().toLowerCase();
  s = s.replace(/([ -]+)([a-zA-Z0-9])/g, function (a, b, c) {
    return c.toUpperCase();
  });
  s = s.replace(/([0-9]+)([a-zA-Z])/g, function (a, b, c) {
    return b + c.toUpperCase();
  });
  return s;
}

/**
 * @name translateRegistry
 * @method
 * @memberof Helpers
 * @summary adds i18n strings to registry object
 * @param {Object} registry registry object
 * @param {Object} [app] complete package object
 * @return {Object} with updated registry
 */
export function translateRegistry(registry, app) {
  let registryLabel = "";
  let i18nKey = "";
  // first we check the default place for a label
  if (registry.label) {
    registryLabel = toCamelCase(registry.label);
    i18nKey = `admin.${registry.provides}.${registryLabel}`;
    // and if we don"t find it, we are trying to look at first
    // registry entry
  } else if (app && app.registry && app.registry.length &&
    app.registry[0].label) {
    registryLabel = toCamelCase(app.registry[0].label);
    i18nKey = `admin.${app.registry[0].provides}.${registryLabel}`;
  }
  registry.i18nKeyLabel = `${i18nKey}Label`;
  registry.i18nKeyDescription = `${i18nKey}Description`;
  registry.i18nKeyPlaceholder = `${i18nKey}Placeholder`;
  registry.i18nKeyTooltip = `${i18nKey}Tooltip`;
  registry.i18nKeyTitle = `${i18nKey}Title`;
  // return registry object with added i18n keys
  return registry;
}

/**
 * @name isObject
 * @method
 * @memberof Helpers
 * @summary Simple is object check.
 * @param {Object} item item to check if is an object
 * @returns {boolean} return true if object
 */
export function isObject(item) {
  return (item && typeof item === "object" && !Array.isArray(item) && item !== null);
}

/**
 * @name mergeDeep
 * @method
 * @memberof Helpers
 * @summary Helper for Deep merge two objects.
 * @param {Object} target deep merge into this object
 * @param {Object} source merge this object
 * @returns {Object} return deep merged object
 */
export function mergeDeep(target, source) {
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        mergeDeep(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    });
  }
  return target;
}
