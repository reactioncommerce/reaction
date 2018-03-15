import url from "url";
import { parse, isValidNumber, getPhoneCode } from "libphonenumber-js";
import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Router } from "/imports/plugins/core/router/lib";
import { Shops } from "/lib/collections";

// Array of ISO Language codes for all languages that use latin based char sets
// list is based on this matrix http://w3c.github.io/typography/gap-analysis/language-matrix.html
// list of lang codes https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
export const latinLangs = ["az", "da", "de", "en", "es", "ff", "fr", "ha", "hr", "hu", "ig", "is", "it", "jv", "ku", "ms", "nl", "no", "om", "pl", "pt", "ro", "sv", "sw", "tl", "tr", "uz", "vi", "yo"]; // eslint-disable-line max-len

// dynamic import of slugiy/transliteration.slugify
let slugify;
async function lazyLoadSlugify() {
  let mod;
  // getting the shops base language
  const lang = getShopLang();
  // if slugify has been loaded but the language has changed
  // to be a non latin based language then load transliteration
  if (slugify && slugify.name === "replace" && latinLangs.indexOf(lang) === -1) {
    mod = await import("transliteration");
  } else if (slugify) {
    // if slugify/transliteration is loaded and no lang change
    return;
  } else if (latinLangs.indexOf(lang) >= 0) {
    // if the shops language use latin based chars load slugify else load transliterations's slugify
    mod = await import("slugify");
  } else {
    mod = await import("transliteration");
  }
  // slugify is exported to modules.default while transliteration is exported to modules.slugify
  slugify = mod.default || mod.slugify;
}


let Media;
if (Meteor.isClient) {
  ({ Media } = require("/imports/plugins/core/files/client"));
} else {
  ({ Media } = require("/imports/plugins/core/files/server"));
}

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
 * @name getShopLang
 * @method
 * @memberof Helpers
 * @return {String} returns current shop language
 */
export function getShopLang() {
  const shopId = getShopId();
  const shop = Shops.findOne({ _id: shopId });
  return shop ? shop.language : "";
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
  let slug;
  Promise.resolve(lazyLoadSlugify());
  if (slugString && slugify) {
    slug = slugify(slugString.toLowerCase());
  } else {
    slug = "";
  }
  return slug;
}

/**
 * @name formatPhoneNumber
 * @method
 * @memberof Helpers
 * @summary prepends country code to phone no. if required
 * @param  {String} phone the original phone no.
 * @param  {String} countryCode the country's code to which the phone no. belongs to
 * @return {String} the phone no. with country extension.
 */
export function formatPhoneNumber(phone, countryCode) {
  try {
    // phone no. already has the country code attached
    if (isValidNumber(phone)) {
      return phone;
    }
    const phoneNumber = parse(phone, countryCode).phone;
    const countryExtension = getPhoneCode(countryCode);
    if (phoneNumber && countryExtension) {
      // try attaching the country code to phone number
      return `${countryExtension}${phoneNumber}`;
    }
    throw new Meteor.Error("invalid-parameter", `Incorrect format for phone number ${phone} with country ${countryCode}`);
  } catch (error) {
    throw new Meteor.Error("invalid-parameter", error);
  }
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

/**
 * @name getPrimaryMediaForItem
 * @summary Gets the FileRecord for the primary media item associated with the variant or product
 *   for the given item
 * @param {Object} item Must have `productId` and/or `variantId` set to get back a result.
 * @return {FileRecord|null}
 */
export function getPrimaryMediaForItem({ productId, variantId } = {}) {
  let result;

  if (variantId) {
    result = Media.findOneLocal({
      "metadata.variantId": variantId
    }, { sort: { "metadata.priority": 1, "uploadedAt": 1 } });
  }

  if (!result && productId) {
    result = Media.findOneLocal({
      "metadata.productId": productId
    }, { sort: { "metadata.priority": 1, "uploadedAt": 1 } });
  }

  return result || null;
}

/**
 * @name getPrimaryMediaForOrderItem
 * @summary Gets the FileRecord for the primary media item associated with the variant or product
 *   for the given item
 * @param {Object} item Must have `productId` and/or `variants._id` set to get back a result.
 * @return {FileRecord|null}
 */
export function getPrimaryMediaForOrderItem({ productId, variants } = {}) {
  const { _id: variantId } = variants || {}; // Order item format
  return getPrimaryMediaForItem({ productId, variantId });
}

/*
 * @name luhnValid
 * @method
 * @memberOf Helpers
 * @summary Checks if a number passes Luhn's test
 * @param {String} cardNumber The card number to check
 * @returns {Boolean} The result of the test
 */
function luhnValid(cardNumber) {
  return [...cardNumber].reverse().reduce((sum, c, i) => {
    let d = parseInt(c, 10);
    if (i % 2 !== 0) { d *= 2; }
    if (d > 9) { d -= 9; }
    return sum + d;
  }, 0) % 10 === 0;
}

// Regex to do card validations
export const ValidCardNumber = Match.Where((x) => /^[0-9]{12,19}$/.test(x) && luhnValid(x));

export const ValidExpireMonth = Match.Where((x) => /^[0-9]{1,2}$/.test(x));

export const ValidExpireYear = Match.Where((x) => /^[0-9]{4}$/.test(x));

export const ValidCVV = Match.Where((x) => /^[0-9]{3,4}$/.test(x));

// Email regex
export const ValidEmail = (x) => /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/.test(x); // eslint-disable-line max-len
