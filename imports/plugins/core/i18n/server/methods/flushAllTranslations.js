import { Meteor } from "meteor/meteor";
import Reaction from "/server/api/core";
import { reloadAllTranslations } from "/server/startup/i18n";

/**
 * @name i18n/flushAllTranslations
 * @method
 * @memberof i18n
 * @example Meteor.call("i18n/flushAllTranslations")
 * @summary Method to remove all translations for all shops, and reload from jsonFiles
 * @return {undefined}
 */
export default function flushAllTranslations() {
  if (!Reaction.hasPermission("admin", Meteor.userId(), Reaction.getPrimaryShopId())) {
    throw new Meteor.Error("access-denied", "Access Denied");
  }

  reloadAllTranslations();
}
