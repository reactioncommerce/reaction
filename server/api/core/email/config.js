import nodemailer from "nodemailer";
import getServiceConfig from "nodemailer-wellknown";
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
 * @return {String} returns an SMTP url if one of the settings have been set
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
  const { service, user, password, host, port } = shopMail;

  let mailString;

  // create a mail url from well-known provider settings (if they exist)
  // https://github.com/nodemailer/nodemailer-wellknown
  if (service && service !== "custom" && user && password) {
    const conf = getServiceConfig(service);

    if (conf) {
      // account for local test providers like Maildev
      if (!conf.host) {
        mailString = `smtp://localhost:${conf.port}`;
      } else {
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


/**
 * getMailConfig - get the email sending config for Nodemailer
 * @return {Object} returns a config object
 */
export function getMailConfig() {
  const processUrl = process.env.MAIL_URL;
  const settingsUrl = Meteor.settings.MAIL_URL;

  const mailString = processUrl || settingsUrl;

  // if MAIL_URL or Meteor settings have been used,
  // parse the URL and create a config object
  if (mailString) {
    // parse the url
    const parsedUrl = url.parse(mailString);
    const creds = parsedUrl.auth.split(":");
    parsedUrl.port = Number(parsedUrl.port);

    Logger.debug(`Using ${parsedUrl.hostname} to send email`);

    // create a nodemailer config from the SMTP url string
    return {
      host: parsedUrl.hostname,
      port: parsedUrl.port,
      secure: parsedUrl.port === "465" || parsedUrl.port === "587",
      auth: {
        user: creds[0],
        pass: creds[1]
      },
      logger: process.env.EMAIL_DEBUG === "true"
    };
  }

  // check for mail settings in the database
  const shopSettings = Reaction.getShopSettings();

  let shopMail;

  if (shopSettings) {
    shopMail = shopSettings.mail || {};
  }

  const { service, user, password, host, port } = shopMail;

  // if a service provider preset was chosen, return a Nodemailer config for it
  // https://github.com/nodemailer/nodemailer-wellknown
  if (service && service !== "custom" && user && password) {
    Logger.debug(`Using ${service} to send email`);

    // get the config from nodemailer-wellknown
    const conf = getServiceConfig(service);

    // account for local test providers like Maildev with no auth
    if (!conf.host) {
      return conf;
    }

    // add the credentials to the config
    conf.auth = { user, pass: password };

    return conf;
  }

  // if a custom config was chosen and all necessary fields exist in the database,
  // return the custom Nodemailer config
  if ((!service || service === "custom") && user && password && host && port) {
    Logger.debug(`Using ${host} to send email`);

    return {
      host,
      port,
      secure: port === 465 || port === 587,
      auth: { user, pass: password },
      logger: process.env.EMAIL_DEBUG === "true"
    };
  }

  // else, return the direct mail config and a warning
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
