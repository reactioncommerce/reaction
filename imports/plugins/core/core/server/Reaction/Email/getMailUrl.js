import Logger from "@reactioncommerce/logger";
import getServiceConfig from "nodemailer-wellknown";
import { Meteor } from "meteor/meteor";
import Reaction from "/server/api/core";

/**
 * @method getMailUrl
 * @summary get the smtp URL for sending emails
 * There are 3 possible ways to set the email configuration and
 * the first value found will be used.
 * The priority order is:
 *   1. MAIL_URL environment variable
 *   2. Meteor settings (MAIL_URL key)
 *   3. Core shop settings from the database
 * @memberof Email
 * @example Reaction.Email.getMailUrl()
 * @return {String} returns an SMTP url if one of the settings have been set
 */
export default function getMailUrl() {
  const shopSettings = Reaction.getShopSettings();

  let shopMail;

  if (shopSettings) {
    shopMail = shopSettings.mail || {};
  }

  // get all possible mail settings
  const processUrl = process.env.MAIL_URL;
  const settingsUrl = Meteor.settings.MAIL_URL;
  const { service, user, password, host, port } = shopMail;

  let mailString;

  // create a mail url from well-known provider settings (if they exist)
  // https://github.com/nodemailer/nodemailer-wellknown
  if (service && service !== "custom") {
    const conf = getServiceConfig(service);

    if (conf) {
      // account for local test providers like Maildev
      if (!conf.host) {
        mailString = `smtp://localhost:${conf.port}`;
      } else if (user && password) {
        mailString = `smtp://${encodeURIComponent(user)}:${password}@${conf.host}:${conf.port}`;
      }
    }
  }

  // create a mail url from custom provider settings (if they exist)
  if ((!service || service === "custom") && user && password && host && port) {
    mailString = `smtp://${encodeURIComponent(user)}:${password}@${host}:${port}`;
  }

  // create the final url from the available options
  const mailUrl = processUrl || settingsUrl || mailString;

  if (!mailUrl) {
    Logger.warn("Reaction.Email.getMailUrl() - no email provider configured");
    return null;
  }

  return mailUrl;
}
