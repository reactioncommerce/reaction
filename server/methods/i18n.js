import { Translations } from "/lib/collections";
import { Reaction } from "/server/api";
import { loadCoreTranslations } from "/server/startup/i18n";

/**
 * Reaction Shop Methods
 */
Meteor.methods({
  /**
   * i18n/flushTranslations
   * @summary Helper method to remove all translations, and reload from jsonFiles
   * @return {undefined}
   */
  "i18n/flushTranslations": function () {
    if (!Reaction.hasAdminAccess()) {
      throw new Meteor.Error(403, "Access Denied");
    }
    const shopId = Reaction.getShopId();
    Translations.remove({
      shopId: shopId
    });
    loadCoreTranslations();
    Reaction.Import.flush();
  },
  /**
   * i18n/addTranslation
   * @param {String | Array} lng - language
   * @param {String} namespace - namespace
   * @param {String} key - i18n key
   * @param {String} message - i18n message
   * @summary Helper method to add translations
   * @return {String} insert result
   */
  "i18n/addTranslation": function (lng, namespace, key, message) {
    check(lng, Match.OneOf(String, Array));
    check(namespace, String);
    check(key, String);
    check(message, String);
    // string or first langauge
    let i18n = lng;
    if (typeof lng === "object") {
      i18n = lng[0];
    }

    if (!Reaction.hasAdminAccess()) {
      throw new Meteor.Error(403, "Access Denied");
    }
    const tran = `
      "i18n": "${i18n}",
      "shopId": "${Reaction.getShopId()}"
    `;

    const setTran = `"translation.${namespace}.${key}": "${message}"`;
    Translations.update({tran}, {setTran});
  }
});
