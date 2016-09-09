import nodemailer from "nodemailer";
import url from "url";
import { Meteor } from "meteor/meteor";
import { Reaction, Logger } from "/server/api";


/**
 * getMailUrl - get the smtp URL for sending emails
 * There are 3 possible ways to set the email configuration and
 * the first value found will be used.
 * The priority order is:
 *   1. MAIL_URL environment variable
 *   2. Meteor settings (MAIL_URL key)
 *   3. Core shop settings from the database
 * @return {String} returns the MAIL_URL if one of the settings have been set
 */
export function getMailUrl() {
  const shopSettings = Reaction.getShopSettings();

  let shopMail;

  if (shopSettings) {
    shopMail = shopSettings.mail || {};
  }

  // get all possible mail settings
  const processUrl = process.env.MAIL_URL;
  const settingsUrl = Meteor.settings.MAIL_URL;
  const { user, password, host, port } = shopMail;

  let mailString;

  // create a mail url from the shop settings (if they exist)
  if (user && password && host && port) {
    mailString = `smtp://${encodeURIComponent(user)}:${password}@${host}:${port}`;
  }

  // create the final url from the available options
  const MAIL_URL = processUrl || settingsUrl || mailString;

  if (!MAIL_URL) {
    return null;
  }

  process.env.MAIL_URL = MAIL_URL;

  return MAIL_URL;
}


/**
 * getMailConfig - get the email sending configs
 * @return {Object} returns a config object for nodemailer
 */
export function getMailConfig() {
  const MAIL_URL = getMailUrl();

  if (!MAIL_URL) {
    Logger.warn(`
      Mail service not configured. Attempting to use direct sending option.
      The mail may send, but messages are far more likely go to the user's spam folder.
      Please configure an SMTP mail sending provider.
    `);
    return {
      direct: true,
      logger: process.env.EMAIL_DEBUG === "true"
    };
  }

  // parse the url
  const parsedUrl = url.parse(MAIL_URL);
  const creds = parsedUrl.auth.split(":");

  // create a nodemailer config
  const config = {
    host: parsedUrl.hostname,
    port: parsedUrl.port,
    secure: parsedUrl.port === "465",
    auth: {
      user: creds[0],
      pass: creds[1]
    },
    logger: process.env.EMAIL_DEBUG === "true"
  };

  Logger.debug(`Using ${config.host} to send email`);

  return config;
}


/**
 * Verify a transporter configuration works
 * https://github.com/nodemailer/nodemailer#verify-smtp-connection-configuration
 * @param {Object} config - a Nodemailer transporter config object
 * @param {Function} callback - optional callback with standard error/result args
 * @return {Promise} returns a Promise if no callback is provided
 */
export function verifyConfig(config, callback) {
  const transporter = nodemailer.createTransport(config);
  return transporter.verify(callback);
}
