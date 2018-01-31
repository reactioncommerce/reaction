import nodemailer from "@reactioncommerce/nodemailer";
import getServiceConfig from "nodemailer-wellknown";
import url from "url";
import { Meteor } from "meteor/meteor";
import { Reaction, Logger } from "/server/api";


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


/**
 * @method getMailConfig
 * @summary get the email sending config for Nodemailer
 * @memberof Email
 * @example Reaction.Email.getMailConfig()
 * @return {{host: String, port: Number, secure: Boolean, auth: Object, logger: Boolean}} returns a config object
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
    const creds = !!parsedUrl.auth && parsedUrl.auth.split(":");
    parsedUrl.port = Number(parsedUrl.port);

    Logger.debug(`Using ${parsedUrl.hostname} to send email`);

    // create a nodemailer config from the SMTP url string
    const config = {
      host: parsedUrl.hostname,
      port: parsedUrl.port,
      // since the port is casted to number above
      secure: parsedUrl.port === 465,
      logger: process.env.EMAIL_DEBUG === "true"
    };

    // add user/pass to the config object if they were found
    if (creds) {
      config.auth = {
        user: creds[0],
        pass: creds[1]
      };
    }

    // don't enforce checking TLS on localhost
    if (parsedUrl.hostname === "localhost") {
      config.ignoreTLS = true;
    }

    return config;
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
  if (service && service !== "custom") {
    Logger.debug(`Using ${service} to send email`);

    // get the config from nodemailer-wellknown
    const conf = getServiceConfig(service);

    // account for local test providers like Maildev with no auth
    if (!conf.host) {
      return conf;
    }

    // add any credentials to the config
    if (user && password) {
      conf.auth = { user, pass: password };
    }

    return conf;
  }

  // if a custom config was chosen and all necessary fields exist in the database,
  // return the custom Nodemailer config
  if ((!service || service === "custom") && host && port) {
    const conf = {
      host,
      port,
      secure: port === 465,
      logger: process.env.EMAIL_DEBUG === "true"
    };

    // don't enforce checking TLS on localhost
    if (conf.host === "localhost") {
      conf.ignoreTLS = true;
    }

    // add any credentials to the config
    if (user && password) {
      conf.auth = { user, pass: password };
    }

    Logger.debug(`Using ${host} to send email`);

    return conf;
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
 * @method verifyConfig
 * @summary Verify a transporter configuration works
 * @see https://github.com/nodemailer/nodemailer#verify-smtp-connection-configuration
 * @memberof Email
 * @param {Object} config - a Nodemailer transporter config object
 * @param {Function} callback - optional callback with standard error/result args
 * @return {Promise} returns a Promise if no callback is provided
 */
export function verifyConfig(config, callback) {
  const transporter = nodemailer.createTransport(config);
  return transporter.verify(callback);
}
