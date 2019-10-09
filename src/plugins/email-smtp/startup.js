import sendSMTPEmail from "./util/sendSMTPEmail.js";

/**
 * @name startup
 * @summary Called on startup. Initializes SMTP email handler.
 * @param {Object} context App context
 * @returns {undefined}
 */
export default function startup(context) {
  context.appEvents.on("sendEmail", (...args) => sendSMTPEmail(context, ...args));
}
