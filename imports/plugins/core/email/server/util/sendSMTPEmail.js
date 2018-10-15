import Logger from "@reactioncommerce/logger";
import nodemailer from "@reactioncommerce/nodemailer";
import { Meteor } from "meteor/meteor";
import Email from "/imports/plugins/core/core/server/Reaction/Email";

export default function sendSMTPEmail(job, { sendEmailCompleted, sendEmailFailed }) {
  // TODO determine if selected email provider is SMTP, if not, return
  const config = Email.getMailConfig();

  if (config.direct) {
    return sendEmailFailed(job, "Mail not configured");
  }

  Logger.debug(config, "Sending email with config");

  const { from, to, subject, html, ...optionalEmailFields } = job.data;
  const transport = nodemailer.createTransport(config);

  transport.sendMail({ from, to, subject, html, ...optionalEmailFields }, Meteor.bindEnvironment((error) => {
    if (error) {
      return sendEmailFailed(job, `Email job failed: ${error.toString()}`);
    }

    return sendEmailCompleted(job, `Successfully sent email to ${to}`);
  }));
}
