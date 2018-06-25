import { Meteor } from "meteor/meteor";
import Reaction from "/server/api/core";
import { reloadTranslationsForShop } from "/server/startup/i18n";

/**
 * @name i18n/flushTranslations
 * @method
 * @memberof i18n
 * @example Meteor.call("i18n/flushTranslations")
 * @summary Method to remove all translations for the current shop, and reload from jsonFiles
 * @return {undefined}
 */
export default function flushTranslations() {
  if (!Reaction.hasAdminAccess()) {
    throw new Meteor.Error("access-denied", "Access Denied");
  }

  const shopId = Reaction.getShopId();
  reloadTranslationsForShop(shopId);
}
