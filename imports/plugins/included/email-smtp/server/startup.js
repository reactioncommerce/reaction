import appEvents from "/imports/node-app/core/util/appEvents";
import sendSMTPEmail from "./util/sendSMTPEmail";

/**
 * @name startup
 * @summary Called on startup. Initializes SMTP email handler.
 * @return {undefined}
 */
export default function startup() {
  appEvents.on("sendEmail", sendSMTPEmail);
}
