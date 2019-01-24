import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import ReactionError from "@reactioncommerce/reaction-error";

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
 * @memberof Helpers
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
  throw new ReactionError("invalid-parameter", "Invalid from or to value specified");
}

/**
 * @name convertLength
 * @method
 * @memberOf Helpers
 * @summary Convert length from/to different Units of Measure
 * @param {String} from The UOL to convert from
 * @param {String} to The UOL to convert to
 * @param {Number} length The value to convert
 * @returns {Number} The converted value
 */
export function convertLength(from, to, length) {
  check(from, Match.OneOf("in", "cm", "ft"));
  check(to, Match.OneOf("in", "cm", "ft"));
  check(length, Number);

  if (from === to) {
    return length;
  }

  if (from === "cm" && to === "in") {
    const convertedLength = length * 0.393;
    return convertedLength;
  }

  if (from === "in" && to === "cm") {
    const convertedLength = length * 2.54;
    return convertedLength;
  }

  if (from === "cm" && to === "ft") {
    const convertedLength = length * 0.0328084;
    return convertedLength;
  }

  if (from === "ft" && to === "cm") {
    const convertedLength = length * 30.48;
    return convertedLength;
  }

  if (from === "in" && to === "ft") {
    const convertedLength = length * 0.0833;
    return convertedLength;
  }

  if (from === "ft" && to === "in") {
    const convertedLength = length * 12;
    return convertedLength;
  }

  // if we made it here, something has gone wrong
  throw new ReactionError("invalid-parameter", "Invalid from or to value specified");
}

/**
 * @name getPrimaryMediaForItem
 * @method
 * @memberof Helpers
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
 * @method
 * @memberof Helpers
 * @summary Gets the FileRecord for the primary media item associated with the variant or product
 *   for the given item
 * @param {Object} item Must have `productId` and `variantId` set to get back a result.
 * @return {FileRecord|null}
 */
export function getPrimaryMediaForOrderItem({ productId, variantId } = {}) {
  return getPrimaryMediaForItem({ productId, variantId });
}

/**
 * @name luhnValid
 * @method
 * @memberof Helpers
 * @summary Checks if a number passes Luhn's test
 * @param {String} cardNumber The card number to check
 * @returns {Boolean} The result of the test
 * @private
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


/**
 * @name operators
 * @constant
 * @memberof Helpers
 * @summary Checks matching via various operators
 * @return {Boolean} the result of the check
 */
export const operators = {
  eq(varA, varB) { return varA === varB; },
  gt(varA, varB) { return varA > varB; },
  lt(varA, varB) { return varA < varB; },
  ne(varA, varB) { return varA !== varB; }
};

/**
 * @name propertyTypes
 * @constant
 * @memberof Helpers
 * @summary Checks matching via various operators
 * @return {Boolean} the result of the check
 */
export const propertyTypes = {
  bool(varA) { return varA.trim().toLowerCase() === "true"; },
  float(varA) { return parseFloat(varA); },
  int(varA) { return parseInt(varA, 10); },
  string(varA) { return varA; }
};
