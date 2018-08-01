import { Meteor } from "meteor/meteor";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import ReactionError from "@reactioncommerce/reaction-error";
import { reloadAllTranslations } from "/imports/plugins/core/core/server/startup/i18n";

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
    throw new ReactionError("access-denied", "Access Denied");
  }

  reloadAllTranslations();
}
