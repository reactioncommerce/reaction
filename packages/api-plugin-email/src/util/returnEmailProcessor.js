import { createRequire } from "module";
import Logger from "@reactioncommerce/logger";
import Random from "@reactioncommerce/random";

const require = createRequire(import.meta.url);

const pkg = require("../../package.json");

const { name, version } = pkg;
const logCtx = {
  name,
  version,
  file: "returnEmailProcessor.js"
};


/**
 * @summary returns a closure function with context contained
 * @param {Object} context - The application context
 * @return {function(Object): Promise<unknown>} The closure function with context contained
 */
export default function returnEmailProcessor(context) {
  /**
   * @param {Object} job - The job specific information
   * @returns {undefined}
   */
  async function processEmailJobs(job) {
    return new Promise(async (resolve, reject) => {
      const { appEvents, collections } = context;
      const { Emails } = collections;
      const jobId = Random.id();

      /**
       * @name sendEmailCompleted
       * @summary Callback for when an email has successfully been sent.
       *  Updates email status in DB, logs a debug message, and marks job as done.
       * @param {Object} completedJob - The completed job info
       * @param {String} message A message to log
       * @returns {undefined} undefined
       */
      async function sendEmailCompleted(completedJob, message) {
        await Emails.updateOne({ jobId }, {
          $set: {
            status: "completed",
            updatedAt: new Date()
          }
        });

        Logger.info({ logCtx, message }, "Send email completed");
        resolve(message);
      }

      /**
       * @name sendEmailFailed
       * @summary Callback for when an email delivery attempt has failed.
       *  Updates email status in DB, logs an error message, and marks job as failed.
       * @param {Object} failedJob - The failed job information
       * @param {String} message A message to log
       * @returns {undefined} undefined
       */
      async function sendEmailFailed(failedJob, message) {
        await Emails.updateOne({ jobId }, {
          $set: {
            status: "failed",
            updatedAt: new Date()
          }
        });

        // TODO This logging leaks PI to logs which is a NO-NO
        Logger.error({ logCtx, message }, "Send email job failed");

        reject(message);
      }

      /**
       * @summary send the email
       * @return {Promise<void>} undefined
       */
      async function process() {
        const { from, to, subject, html, ...optionalEmailFields } = job;

        if (!from || !to || !subject || !html) {
          const msg = "Email job requires an options object with to/from/subject/html.";
          Logger.error(`[Job]: ${msg}`);
          reject(msg);
          return;
        }

        const createdAt = new Date();
        await Emails.updateOne({ jobId }, {
          $set: {
            from,
            to,
            subject,
            html,
            status: "processing",
            updatedAt: createdAt,
            ...optionalEmailFields
          },
          $setOnInsert: {
            createdAt
          }
        }, {
          upsert: true
        });

        await appEvents.emit("sendEmail", { job, sendEmailCompleted, sendEmailFailed });
      }
      await process();
    });
  }
  return processEmailJobs;
}

