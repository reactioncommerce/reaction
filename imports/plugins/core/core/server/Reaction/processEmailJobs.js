import Logger from "@reactioncommerce/logger";
import { Emails, Jobs } from "/lib/collections";
import appEvents from "/imports/node-app/core/util/appEvents";

/**
 * @returns {undefined}
 */
export default function processEmailJobs() {
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
    /**
     * @name sendEmailCompleted
     * @summary Function to call when an email has successfully been sent
     * @param {Object} job The job that completed
     * @param {String} message A message to log
     * @return {undefined} undefined
     */
    function sendEmailCompleted(job, message) {
      const jobId = job._doc._id;

      Emails.update({ jobId }, {
        $set: {
          status: "completed"
        }
      });

      Logger.debug(message);

      return job.done();
    }

    /**
     * @name sendEmailFailed
     * @summary Function to call when an email delivery attempt has failed
     * @param {Object} job The job that failed
     * @param {String} message A message to log
     * @return {undefined} undefined
     */
    function sendEmailFailed(job, message) {
      const jobId = job._doc._id;

      Emails.update({ jobId }, {
        $set: {
          status: "failed"
        }
      });

      Logger.error(message);

      return job.fail(message);
    }

    jobs.forEach((job) => {
      const { from, to, subject, html, ...optionalEmailFields } = job.data;

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
          status: "processing",
          ...optionalEmailFields
        }
      }, {
        upsert: true
      });

      appEvents.emit("sendEmail", job, { sendEmailCompleted, sendEmailFailed });
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
