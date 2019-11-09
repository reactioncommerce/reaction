import Logger from "@reactioncommerce/logger";
import ReactionError from "@reactioncommerce/reaction-error";
import envConfig from "../config.js";

/**
 * @summary get email sending config for Nodemailer based on parsing a mail URL
 * @param {String} mailUrl The mail URL
 * @returns {Object} A mail config object
 */
function getConfigFromMailUrl(mailUrl) {
  const urlSections = mailUrl.split(":");
  // Prevent URL parsing from breaking due to invalid characters in user/password
  // Look for invalid characters in username,
  // ignore the first two // as they are port of the protocol in username section.
  // Also look for invalid character in password, split with @ delimiter to ignore host and only look at password.
  if (urlSections[1].slice(2).indexOf("/") >= 0 || urlSections[2].split("@")[0].indexOf("/") >= 0) {
    throw new ReactionError(`
      Invalid character detected in environment variable MAIL_URL, 
      user or password has invalid characters, please replace "/" with "%2F"
    `);
  }

  const parsedUrl = new URL(mailUrl);

  Logger.debug(`Using ${parsedUrl.hostname} to send email`);

  // create a nodemailer config from the SMTP url string
  const config = {
    host: parsedUrl.hostname,
    port: parsedUrl.port,
    secure: parseInt(parsedUrl.port, 10) === 465
  };

  // add user/pass to the config object if they were found
  if (parsedUrl.username && parsedUrl.password) {
    config.auth = {
      user: decodeURIComponent(parsedUrl.username),
      pass: decodeURIComponent(parsedUrl.password)
    };
  }

  // don't enforce checking TLS on localhost
  if (parsedUrl.hostname === "localhost") {
    config.ignoreTLS = true;
  }

  return config;
}

/**
 * @summary get the email sending config for Nodemailer
 * @returns {{host: String, port: Number, secure: Boolean, auth: Object, logger: Boolean}} returns a config object
 */
export default async function getMailConfig() {
  const { MAIL_URL, EMAIL_DEBUG } = envConfig;
  const logger = EMAIL_DEBUG === "true";
  let config = {};
  let direct = true;

  // If a mail service config URL is provided, use it to build the mailer's config.
  if (MAIL_URL) {
    config = getConfigFromMailUrl(MAIL_URL);
    direct = false;
  }

  if (direct) {
    throw new ReactionError("No valid Mail service configuration found, please set the \"MAIL_URL\" environment variable.");
  }

  return {
    ...config,
    logger
  };
}
