import nodemailer from "@reactioncommerce/nodemailer";

/**
 * @method verifyConfig
 * @summary Verify a transporter configuration works
 * @see https://github.com/nodemailer/nodemailer#verify-smtp-connection-configuration
 * @memberof Email
 * @param {Object} config - a Nodemailer transporter config object
 * @param {Function} callback - optional callback with standard error/result args
 * @return {Promise} returns a Promise if no callback is provided
 */
export default function verifyConfig(config, callback) {
  const transporter = nodemailer.createTransport(config);
  return transporter.verify(callback);
}
