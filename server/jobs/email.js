import { Email } from "meteor/email";
import { Job } from "meteor/vsivsi:job-collection";
import { Jobs } from "/lib/collections";
import { Reaction, Logger } from "/server/api";

export default function () {
  /**
   * Send Email job
   *
   * Example usage:
   * new Job(Jobs, "sendEmail", { from, to, subject, html }).save();
   */
  const sendEmail = Job.processJobs(Jobs, "sendEmail", {
    pollInterval: 5 * 60 * 1000, // poll every 5 mins as a backup - see the realtime observer below
    workTimeout: 20000, // fail if it takes longer than 20secs
    payload: 10
  }, (jobs, callback) => {
    jobs.forEach((job) => {
      const { from, to, subject, html } = job.data;
      // Logger.warn(job.data, "email options");

      if (!from || !to || !subject || !html) {
        const msg = "Email job requires an options object with to/from/subject/html.";
        Logger.error(`[Job]: ${msg}`);
        return job.fail(msg);
      }

      if (!Reaction.configureMailUrl()) {
        return job.fail("Mail not configured");
      }

      try {
        Email.send({ from, to, subject, html });
        Logger.info(`Successfully sent email to ${to}`);
      } catch (error) {
        Logger.error(error, "Email job failed");
        return job.fail(error.toString());
      }

      return job.done();
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
