import url from "url";
import { slugify } from "transliteration";
import { Meteor } from "meteor/meteor";
import { Router } from "/imports/plugins/core/router/lib";
import { Shops } from "/lib/collections";

/**
 * getShopId
 * @return {String} returns current shopId
 */
export function getShopId() {
  const domain = url.parse(Meteor.absoluteUrl()).hostname;

  const shop = Shops.find({ domains: { $in: [domain] } }, {
    limit: 1
  }).fetch()[0];

  return !!shop ? shop._id : null;
}


/**
 * getShopName
 * @return {String} returns current shop name
 */
export function getShopName() {
  const domain = url.parse(Meteor.absoluteUrl()).hostname;

  const shop = Shops.find({ domains: { $in: [domain] } }, {
    limit: 1
  }).fetch()[0];

  return !!shop ? shop.name : null;
}

/**
 * getShopPrefix
 * @param {String} leading - Default "/", prefix, the prefix with a leading shash
 * @return {String} returns shop url prefix
 */
export function getShopPrefix(leading = "/") {
  return leading + getSlug(getShopName().toLowerCase());
}

/**
 * getAbsoluteUrl
 * @param {String} path - path to append to absolute Url, path should be prefixed with / if necessary
 * @return {String} returns absolute url (shop prefix + path)
 */
export function getAbsoluteUrl(path) {
  const prefix = getShopPrefix("");
  return Meteor.absoluteUrl(`${prefix}${path}`);
}

/**
 * getCurrentTag
 * @return {String} returns current tag
 */
export function getCurrentTag() {
  if (Router.getRouteName() === "tag") {
    return Router.current().params.slug;
  }
  return null;
}


/**
 * getSlug - return a slugified string using "slugify" from transliteration
 * https://www.npmjs.com/package/transliteration
 * @param  {String} slugString - string to slugify
 * @return {String} slugified string
 */
export function getSlug(slugString) {
  return slugString ? slugify(slugString) : "";
}

/**
 * toCamelCase helper for i18n
 * @summary special toCamelCase for converting a string to camelCase for use with i18n keys
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
 * translateRegistry
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
 * Simple is object check.
 * @param {Object} item item to check if is an object
 * @returns {boolean} return true if object
 */
export function isObject(item) {
  return (item && typeof item === "object" && !Array.isArray(item) && item !== null);
}

/**
 * Helper for Deep merge two objects.
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
