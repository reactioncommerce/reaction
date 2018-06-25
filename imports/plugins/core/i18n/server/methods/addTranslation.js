import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Translations } from "/lib/collections";
import Reaction from "/imports/plugins/core/core/server/Reaction";

/**
 * @name i18n/addTranslation
 * @method
 * @memberof i18n
 * @example Meteor.call("i18n/addTranslation", "en", "addProductLabel", "Add product")
 * @param {String | Array} lng - language
 * @param {String} namespace - namespace
 * @param {String} key - i18n key
 * @param {String} message - i18n message
 * @summary Meteor method to add translations
 * @return {String} insert result
 */
export default function addTranslation(lng, namespace, key, message) {
  check(lng, Match.OneOf(String, Array));
  check(namespace, String);
  check(key, String);
  check(message, String);
  // string or first language
  let i18n = lng;
  if (typeof lng === "object") {
    [i18n] = lng;
  }

  if (!Reaction.hasAdminAccess()) {
    throw new Meteor.Error("access-denied", "Access Denied");
  }
  const tran = `
    "i18n": "${i18n}",
    "shopId": "${Reaction.getShopId()}"
  `;

  const setTran = `"translation.${namespace}.${key}": "${message}"`;
  Translations.update({ tran }, { setTran });
}
