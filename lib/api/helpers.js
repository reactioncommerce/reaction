import url from "url";
import { slugify } from "transliteration";
import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
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
    return (shop && shop.name) || "";
  }

  const domain = url.parse(Meteor.absoluteUrl()).hostname;

  shop = Shops.findOne({ domains: { $in: [domain] } });

  return shop ? shop.name : "";
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
    return `/shop${slug}`;
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
  s = s.replace(/([ -]+)([a-zA-Z0-9])/g, (a, b, c) => c.toUpperCase());
  s = s.replace(/([0-9]+)([a-zA-Z])/g, (a, b, c) => b + c.toUpperCase());
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
    Object.keys(source).forEach((key) => {
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

/**
 * @name convertWeight
 * @method
 * @memberOf Helpers
 * @summary Convert weight from/to different Units of Measure
 * @param {String} from The UOM to convert from
 * @param {String} to The UOM to convert to
 * @param {Number} weight The value to convert
 * @returns {Number} The converted value
 */
export function convertWeight(from, to, weight) {
  check(from, String); // we need to check for specific values
  check(to, String);
  check(weight, Number);

  if (from === to) {
    return weight;
  }
  // grams
  if (from === "lb" && to === "g") {
    const convertedWeight = weight * 453.592;
    return convertedWeight;
  }

  if (from === "kg" && to === "g") {
    const convertedWeight = weight * 1000;
    return convertedWeight;
  }

  if (from === "oz" && to === "g") {
    const convertedWeight = weight * 28.3495;
    return convertedWeight;
  }

  // lbs
  if (from === "kg" && to === "lb") {
    const convertedWeight = weight * 2.20462;
    return convertedWeight;
  }

  if (from === "g" && to === "lb") {
    const convertedWeight = weight * 0.00220462;
    return convertedWeight;
  }

  if (from === "oz" && to === "lb") {
    const convertedWeight = weight * 0.0625;
    return convertedWeight;
  }

  // oz
  if (from === "lb" && to === "oz") {
    const convertedWeight = weight * 16;
    return convertedWeight;
  }

  if (from === "g" && to === "oz") {
    const convertedWeight = weight * 0.035274;
    return convertedWeight;
  }

  if (from === "kg" && to === "oz") {
    const convertedWeight = weight * 35.274;
    return convertedWeight;
  }

  // kilograms
  if (from === "g" && to === "kg") {
    const convertedWeight = weight * 0.001;
    return convertedWeight;
  }

  if (from === "oz" && to === "kg") {
    const convertedWeight = weight * 0.0283495;
    return convertedWeight;
  }

  if (from === "lb" && to === "kg") {
    const convertedWeight = weight * 0.453592;
    return convertedWeight;
  }
  // if we made it here, something has gone wrong
  throw new Meteor.Error("invalid-parameter", "Invalid from or to value specified");
}
