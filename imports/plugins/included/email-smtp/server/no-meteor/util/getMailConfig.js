import url from "url";
import Logger from "@reactioncommerce/logger";
import getServiceConfig from "nodemailer-wellknown";

/**
 * @summary get email sending config for Nodemailer based on parsing a mail URL
 * @param {Boolean} logger Whether to log debug messages
 * @param {String} mailUrl The mail URL
 * @return {Object} A mail config object
 */
function getConfigFromMailUrl({ logger, mailUrl }) {
  // parse the url
  const parsedUrl = url.parse(mailUrl);
  const credentials = parsedUrl.auth && parsedUrl.auth.split(":");
  parsedUrl.port = Number(parsedUrl.port);

  Logger.debug(`Using ${parsedUrl.hostname} to send email`);

  // create a nodemailer config from the SMTP url string
  const config = {
    host: parsedUrl.hostname,
    port: parsedUrl.port,
    // since the port is casted to number above
    secure: parsedUrl.port === 465,
    logger
  };

  // add user/pass to the config object if they were found
  if (credentials) {
    config.auth = {
      user: credentials[0],
      pass: credentials[1]
    };
  }

  // don't enforce checking TLS on localhost
  if (parsedUrl.hostname === "localhost") {
    config.ignoreTLS = true;
  }

  return config;
}

/**
 * @summary get email sending config for Nodemailer based on well-known service name
 *   https://github.com/nodemailer/nodemailer-wellknown
 * @param {Boolean} logger Whether to log debug messages
 * @param {String} [password] The service password
 * @param {String} service The service name
 * @param {String} [user] The service user
 * @return {Object} A mail config object
 */
function getStandardServiceConfig({ logger, password, service, user }) {
  Logger.debug(`Using ${service} to send email`);

  // get the config from nodemailer-wellknown
  const conf = getServiceConfig(service);
  conf.logger = logger;

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

/**
 * @summary get email sending config for Nodemailer based on custom host and port
 * @param {String} host The mail server host
 * @param {Boolean} logger Whether to log debug messages
 * @param {String} [password] The service password
 * @param {Number} port The port number
 * @param {String} [user] The service user
 * @return {Object} A mail config object
 */
function getCustomServiceConfig({ host, logger, password, port, user }) {
  const conf = {
    host,
    port,
    secure: port === 465,
    logger
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

/**
 * @summary get the email sending config for Nodemailer
 * @param {Object} context App context
 * @param {String} shopId The ID of the shop for which to get email sending config
 * @return {{host: String, port: Number, secure: Boolean, auth: Object, logger: Boolean}} returns a config object
 */
export default async function getMailConfig(context, shopId) {
  const { collections } = context;
  const { Packages } = collections;
  const { MAIL_URL, EMAIL_DEBUG } = process.env;
  const logger = EMAIL_DEBUG === "true";

  /**
   * Use MAIL_URL if present
   */
  if (MAIL_URL) return getConfigFromMailUrl({ logger, mailUrl: MAIL_URL });

  /**
   * Fall back to a standard service
   */
  const settings = await Packages.findOne({ name: "core", shopId }) || {};
  const shopSettings = settings.settings || {};
  const { service, user, password, host, port } = shopSettings.mail || {};

  if (service && service !== "custom") return getStandardServiceConfig({ logger, password, service, user });

  /**
   * Fall back to a custom service
   */
  if (host && port) return getCustomServiceConfig({ host, logger, password, port, user });

  /**
   * If all else fails, try direct sending but warn that this rarely works.
   */
  Logger.warn(`
    Mail service not configured. Attempting to use direct sending option.
    The mail may send, but messages are far more likely go to the user's spam folder.
    Please configure an SMTP mail sending provider.
  `);

  return {
    direct: true,
    logger
  };
}
