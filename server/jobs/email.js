import nodemailer from "@reactioncommerce/nodemailer";
import { Meteor } from "meteor/meteor";
import { Emails, Jobs } from "/lib/collections";
import { Reaction, Logger } from "/server/api";

export default function () {
  /**
   * Send Email job
   *
   * Example usage:
   * new Job(Jobs, "sendEmail", { from, to, subject, html }).save();
   */
  const sendEmail = Jobs.processJobs("sendEmail", {
    pollInterval: 5 * 60 * 1000, // poll every 5 mins as a backup - see the realtime observer below
    workTimeout: 2 * 60 * 1000, // fail if it takes longer than 2mins
    payload: 20
  }, (jobs, callback) => {
    jobs.forEach((job) => {
      const { from, to, subject, html } = job.data;

      if (!from || !to || !subject || !html) {
        const msg = "Email job requires an options object with to/from/subject/html.";
        Logger.error(`[Job]: ${msg}`);
        return job.fail(msg, { fatal: true });
      }

      const jobId = job._doc._id;

      Emails.update({ jobId }, {
        $set: {
          from,
          to,
          subject,
          html,
          status: "processing"
        }
      }, {
        upsert: true
      });

      const config = Reaction.Email.getMailConfig();

      if (config.direct) {
        Emails.update({ jobId }, {
          $set: {
            status: "failed"
          }
        });
        const msg = "Mail not configured";
        Logger.error(msg);
        return job.fail(msg);
      }

      Logger.debug(config, "Sending email with config");

      const transport = nodemailer.createTransport(config);

      transport.sendMail({ from, to, subject, html }, Meteor.bindEnvironment((error) => {
        if (error) {
          Emails.update({ jobId }, {
            $set: {
              status: "failed"
            }
          });
          Logger.error(error, "Email job failed");
          return job.fail(error.toString());
        }
        Emails.update({ jobId }, {
          $set: {
            status: "completed"
          }
        });
        Logger.debug(`Successfully sent email to ${to}`);
        return job.done();
      }));

      return true;
    });

    return callback();
  });

  // Job Collection Observer
  // This processes an email sending job as soon as it's submitted
  Jobs.find({
    type: "sendEmail",
    status: "ready"
  }).observe({
    added() {
      sendEmail.trigger();
    }
  });
}
