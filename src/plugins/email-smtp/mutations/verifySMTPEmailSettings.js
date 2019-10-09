import SimpleSchema from "simpl-schema";
import Logger from "@reactioncommerce/logger";
import nodemailer from "@reactioncommerce/nodemailer";
import getServiceConfig from "nodemailer-wellknown";
import ReactionError from "@reactioncommerce/reaction-error";
import getMailConfig from "../util/getMailConfig.js";

const inputSchema = new SimpleSchema({
  host: {
    type: String,
    optional: true
  },
  password: String,
  port: {
    type: Number,
    optional: true
  },
  service: String,
  shopId: String,
  user: String
});

/**
 * @name verifySMTPEmailSettings
 * @summary Verify the current email configuration
 * @param {Object} context - an object containing the per-request state
 * @param {Object} input - an object of all mutation arguments that were sent by the client
 * @param {String} [input.host] - The host of the SMTP email service. Automatically provided if service !== `custom`.
 * @param {String} input.password - password of SMTP email service account.
 * @param {String} [input.port] - The port of the SMTP email service. Automatically provided if service !== `custom`.
 * @param {String} input.service - SMTP email service to use.
 * @param {String} input.shopId - ShopID this setting belongs to.
 * @param {String} input.user - username of SMTP email service account.
 * @returns {Boolean} - returns true if SMTP connection succeeds
 */
export default async function verifySMTPEmailSettings(context, input) {
  inputSchema.validate(input);

  const { userHasPermission } = context;
  const { host, port, service, shopId, user, password } = input;

  if (!userHasPermission(["owner", "admin", "dashboard"], shopId)) throw new ReactionError("access-denied", "Access denied");

  let config;

  // if a settings object has been provided, build a config
  if (typeof input === "object") {
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
    config = await getMailConfig(context, shopId);
  }

  const logConfig = { ...config };
  delete logConfig.auth;
  Logger.debug(logConfig, "Verifying email config settings");

  const transporter = nodemailer.createTransport(config);

  let isVerified;
  try {
    isVerified = await transporter.verify();
  } catch (error) {
    throw new ReactionError(error.responseCode, error.response);
  }

  return isVerified;
}
