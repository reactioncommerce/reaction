import Logger from "@reactioncommerce/logger";
import nodemailer from "@reactioncommerce/nodemailer";
import getMailConfig from "./getMailConfig";

/**
 * @name sendSMTPEmail
 * @summary Responds to the "sendEmail" app event to send an email via SMTP
 * @param {Object} context App context
 * @param {Object} job Current sendEmail job being processed
 * @param {Function} sendEmailCompleted Called when email was successfully sent
 * @param {Function} sendEmailFailed Called on error
 * @return {undefined} Calls one of the callbacks with a return
 */
export default async function sendSMTPEmail(context, { job, sendEmailCompleted, sendEmailFailed }) {
  const config = await getMailConfig(context);
  if (config.direct) {
    sendEmailFailed(job, "SMTP mail settings not configured");
    return;
  }

  Logger.debug(config, "Sending SMTP email with config");

  const { from, to, subject, html, ...optionalEmailFields } = job.data;
  const transport = nodemailer.createTransport(config);

  transport.sendMail({ from, to, subject, html, ...optionalEmailFields }, (error) => {
    if (error) {
      sendEmailFailed(job, `Email job failed: ${error.toString()}`);
    } else {
      sendEmailCompleted(job, `Successfully sent email to ${to}`);
    }
  });
}
