import Logger from "@reactioncommerce/logger";
import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Packages } from "/lib/collections";
import Reaction from "/server/api/core";

/**
 * @name email/saveSettings
 * @method
 * @summary Save new email configuration
 * @memberof Email/Methods
 * @param {Object} settings - mail provider settings
 * @return {Boolean} - returns true if update succeeds
 */
export default function saveSettings(settings) {
  if (!Reaction.hasPermission(["owner", "admin", "dashboard"], this.userId)) {
    Logger.error("email/saveSettings: Access Denied");
    throw new Meteor.Error("access-denied", "Access Denied");
  }

  check(settings, {
    service: String,
    host: Match.Optional(String),
    port: Match.Optional(Number),
    user: Match.Optional(String),
    password: Match.Optional(String)
  });

  Packages.update({ name: "core", shopId: Reaction.getShopId() }, {
    $set: {
      "settings.mail": settings
    }
  });

  delete settings.password;

  Logger.info(settings, "Email settings updated");

  return true;
}
