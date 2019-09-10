import { check } from "meteor/check";
import { Reaction } from "/lib/api";
import ReactionError from "@reactioncommerce/reaction-error";
import { Shops } from "/lib/collections";

/**
 * @name shop/updateLanguageConfiguration
 * @method
 * @memberof Shop/Methods
 * @summary enable / disable a language
 * @param {String} language - language name | "all" to bulk enable / disable
 * @param {Boolean} enabled - true / false
 * @returns {Array} returns workflow array
 */
export default function updateLanguageConfiguration(language, enabled) {
  check(language, String);
  check(enabled, Boolean);

  // must have core permissions
  if (!Reaction.hasPermission("core")) {
    throw new ReactionError("access-denied", "Access Denied");
  }
  this.unblock();

  const shopId = Reaction.getShopId();

  const shop = Shops.findOne({ _id: shopId });

  const defaultLanguage = shop.language;

  if (language === defaultLanguage && !enabled) {
    throw new ReactionError("invalid-param", "Cannot disable the shop default language");
  }

  if (language === "all") {
    const updateObject = {};

    if (Array.isArray(shop.languages)) {
      shop.languages.forEach((languageData, index) => {
        if (languageData.i18n === defaultLanguage) {
          updateObject[`languages.${index}.enabled`] = true;
        } else {
          updateObject[`languages.${index}.enabled`] = enabled;
        }
      });
    }

    return Shops.update({
      _id: shopId
    }, {
      $set: updateObject
    });
  }

  return Shops.update({
    "_id": shopId,
    "languages.i18n": language
  }, {
    $set: {
      "languages.$.enabled": enabled
    }
  });
}
