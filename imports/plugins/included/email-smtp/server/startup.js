import sendSMTPEmail from "./util/sendSMTPEmail";

/**
 * @name startup
 * @summary Called on startup. Initializes SMTP email handler.
 * @param {Object} context App context
 * @return {undefined}
 */
export default function startup(context) {
  context.appEvents.on("sendEmail", (...args) => sendSMTPEmail(context, ...args));
}
