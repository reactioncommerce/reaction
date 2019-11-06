import Logger from "@reactioncommerce/logger";

/**
 * @summary get email sending config for Nodemailer based on parsing a mail URL
 * @param {Boolean} logger Whether to log debug messages
 * @param {String} mailUrl The mail URL
 * @returns {Object} A mail config object
 */
function getConfigFromMailUrl({ logger, mailUrl }) {
  // parse the url
  const parsedUrl = new URL(mailUrl);
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
 * @summary get the email sending config for Nodemailer
 * @returns {{host: String, port: Number, secure: Boolean, auth: Object, logger: Boolean}} returns a config object
 */
export default async function getMailConfig() {
  const { MAIL_URL, EMAIL_DEBUG } = process.env;
  const logger = EMAIL_DEBUG === "true";

  /**
   * Use MAIL_URL if present
   */
  if (MAIL_URL) return getConfigFromMailUrl({ logger, mailUrl: MAIL_URL });

  /**
   * Try direct sending but warn that this rarely works.
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
