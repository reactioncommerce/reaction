import Logger from "@reactioncommerce/logger";
import getServiceConfig from "nodemailer-wellknown";
import url from "url";
import { Meteor } from "meteor/meteor";
import Reaction from "/imports/plugins/core/core/server/Reaction";

/**
 * @method getMailConfig
 * @summary get the email sending config for Nodemailer
 * @memberof Email
 * @example Reaction.Email.getMailConfig()
 * @return {{host: String, port: Number, secure: Boolean, auth: Object, logger: Boolean}} returns a config object
 */
export default function getMailConfig() {
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
