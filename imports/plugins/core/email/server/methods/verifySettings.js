import Logger from "@reactioncommerce/logger";
import getServiceConfig from "nodemailer-wellknown";
import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import ReactionError from "/imports/plugins/core/graphql/server/no-meteor/ReactionError";

/**
 * @name email/verifySettings
 * @method
 * @summary Verify the current email configuration
 * @memberof Email/Methods
 * @param {Object} settings - optional settings object (otherwise uses settings in database)
 * @return {Boolean} - returns true if SMTP connection succeeds
 */
export default function verifySettings(settings) {
  if (!Reaction.hasPermission(["owner", "admin", "dashboard"], this.userId)) {
    Logger.error("email/verifySettings: Access Denied");
    throw new ReactionError("access-denied", "Access Denied");
  }

  this.unblock();

  check(settings, Match.Optional(Object));

  let config;

  // if a settings object has been provided, build a config
  if (typeof settings === "object") {
    const { service, host, port, user, password } = settings;

    if (service === "custom" && host && port) {
      // create a custom Nodemailer config
      config = { host, port };

      if (host === "localhost") {
        config.ignoreTLS = true;
      }
    } else if (service) {
      // create a Nodemailer config from the nodemailer-wellknown services
      config = getServiceConfig(service) || {};
    }

    if (user && password) {
      config.auth = { user, pass: password };
    }
  }

  const { Email } = Reaction;

  const conf = config || Email.getMailConfig();

  Logger.debug(conf, "Verifying email config settings");

  try {
    return Meteor.wrapAsync(Email.verifyConfig)(conf);
  } catch (e) {
    Logger.error(e);
    throw new ReactionError(e.responseCode, e.response);
  }
}
