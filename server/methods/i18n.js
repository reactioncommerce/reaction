import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Translations } from "/lib/collections";
import { Reaction } from "/server/api";
import { reloadAllTranslations, reloadTranslationsForShop } from "/server/startup/i18n";

Meteor.methods({
  /**
   * @name i18n/flushTranslations
   * @method
   * @memberof i18n
   * @example Meteor.call("i18n/flushTranslations")
   * @summary Method to remove all translations for the current shop, and reload from jsonFiles
   * @return {undefined}
   */
  "i18n/flushTranslations"() {
    if (!Reaction.hasAdminAccess()) {
      throw new Meteor.Error("access-denied", "Access Denied");
    }

    const shopId = Reaction.getShopId();
    reloadTranslationsForShop(shopId);
  },

  /**
 * @name i18n/flushAllTranslations
 * @method
 * @memberof i18n
 * @example Meteor.call("i18n/flushAllTranslations")
 * @summary Method to remove all translations for all shops, and reload from jsonFiles
 * @return {undefined}
 */
  "i18n/flushAllTranslations"() {
    if (!Reaction.hasPermission("admin", Meteor.userId(), Reaction.getPrimaryShopId())) {
      throw new Meteor.Error("access-denied", "Access Denied");
    }

    reloadAllTranslations();
  },

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
  "i18n/addTranslation"(lng, namespace, key, message) {
    check(lng, Match.OneOf(String, Array));
    check(namespace, String);
    check(key, String);
    check(message, String);
    // string or first langauge
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
});
