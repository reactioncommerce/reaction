import Logger from "@reactioncommerce/logger";
import nodemailer from "@reactioncommerce/nodemailer";
import { Meteor } from "meteor/meteor";
import { Packages } from "/lib/collections";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import Email from "/imports/plugins/core/core/server/Reaction/Email";

/**
 * @name sendSMTPEmail
 * @summary Responds to the "sendEmail" app event to send an email via SMTP
 * @param {Object} job Current sendEmail job being processed
 * @param {Object} callbacks Functions to call on success or failure
 * @param {Function} callbacks.sendEmailCompleted Call when email was successfully sent
 * @param {Function} callbacks.sendEmailFailed Call on error
 * @return {undefined} Call one of the callbacks with a return statement
 */
export default function sendSMTPEmail(job, { sendEmailCompleted, sendEmailFailed }) {
  // Determine if email provider is SMTP
  const smtpProviders = require("nodemailer-wellknown/services.json");
  const smtpProviderNames = Object.keys(smtpProviders);
  const settings = Reaction.getShopSettings();
  const mailSettings = settings.mail || {};
  const mailServiceName = mailSettings.service || "";

  if (mailServiceName === "") {
    return sendEmailFailed(job, "Mail not configured");
  }

  if (smtpProviderNames.includes(mailServiceName) === false) {
    // Using non-SMTP email provider, skip, assuming another plugin will handle job
    return;
  }

  const config = Email.getMailConfig();
  if (config.direct) {
    return sendEmailFailed(job, "SMTP mail settings not configured");
  }

  Logger.debug(config, "Sending SMTP email with config");

  const { from, to, subject, html, ...optionalEmailFields } = job.data;
  const transport = nodemailer.createTransport(config);

  transport.sendMail({ from, to, subject, html, ...optionalEmailFields }, Meteor.bindEnvironment((error) => {
    if (error) {
      return sendEmailFailed(job, `Email job failed: ${error.toString()}`);
    }

    return sendEmailCompleted(job, `Successfully sent email to ${to}`);
  }));
}
