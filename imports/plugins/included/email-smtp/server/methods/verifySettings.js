import Logger from "@reactioncommerce/logger";
import nodemailer from "@reactioncommerce/nodemailer";
import getServiceConfig from "nodemailer-wellknown";
import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import getGraphQLContextInMeteorMethod from "/imports/plugins/core/graphql/server/getGraphQLContextInMeteorMethod";
import ReactionError from "@reactioncommerce/reaction-error";
import getMailConfig from "../util/getMailConfig";

/**
 * @name email/verifySettings
 * @method
 * @summary Verify the current email configuration
 * @memberof Email/Methods
 * @param {Object} [settings] optional settings object (otherwise uses settings in database)
 * @return {Boolean} - returns true if SMTP connection succeeds
 */
export default function verifySettings(settings) {
  if (!Reaction.hasPermission(["owner", "admin", "dashboard"], this.userId)) {
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

  if (!config) {
    const shopId = Reaction.getShopId();
    const context = Promise.await(getGraphQLContextInMeteorMethod(Reaction.getUserId()));
    config = Promise.await(getMailConfig(context, shopId));
  }

  Logger.debug(config, "Verifying email config settings");

  const transporter = nodemailer.createTransport(config);

  try {
    return Meteor.wrapAsync(transporter.verify.bind(transporter))();
  } catch (error) {
    Logger.error(error);
    throw new ReactionError(error.responseCode, error.response);
  }
}
