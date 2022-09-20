import nodemailer from "@reactioncommerce/nodemailer";
import { SMTPConfig } from "../config.js";

/**
 * @name sendSMTPEmail
 * @summary Responds to the "sendEmail" app event to send an email via SMTP
 * @param {Object} context App context
 * @param {Object} job Current sendEmail job being processed
 * @param {Function} sendEmailCompleted Called when email was successfully sent
 * @param {Function} sendEmailFailed Called on error
 * @returns {undefined} Calls one of the callbacks with a return
 */
export default async function sendSMTPEmail(context, { job, sendEmailCompleted, sendEmailFailed }) {
  const { to, shopId, ...otherEmailFields } = job.data;

  const transport = nodemailer.createTransport(SMTPConfig);

  transport.sendMail({ to, shopId, ...otherEmailFields }, (error) => {
    if (error) {
      sendEmailFailed(job, `Email job failed: ${error.toString()}`);
    } else {
      sendEmailCompleted(job, `Successfully sent email to ${to}`);
    }
  });
}
