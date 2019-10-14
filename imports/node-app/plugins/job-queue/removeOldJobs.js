import Logger from "@reactioncommerce/logger";
import { Job, Jobs } from "./jobs.js";

const jobRetryOptions = {
  retries: 5,
  wait: 60000,
  backoff: "exponential"
};
const jobFrequency = "every day";

/**
 * @summary Register a job and worker to remove old jobs.
 * @returns {undefined}
 */
export default function removeOldJobs({
  purgeAfterDays,
  type: jobTypeToPurge
}) {
  const jobType = `jobControl/removeStaleJobs/${jobTypeToPurge}`;
  const purgeAfterMs = purgeAfterDays * 24 * 60 * 60 * 1000;

  Jobs.whenReady(() => {
    Jobs.processJobs(jobType, {
      pollInterval: 60 * 60 * 1000, // backup polling, see observer below
      workTimeout: 60 * 1000
    }, async (job, callback) => {
      Logger.debug(`${jobType}: started`);

      const olderThan = new Date(Date.now() - purgeAfterMs);

      const ids = await Jobs.find({
        type: jobTypeToPurge,
        status: {
          $in: ["cancelled", "completed", "failed"]
        },
        updated: {
          $lt: olderThan
        }
      }, {
        projection: {
          _id: 1
        }
      }).map((jobDoc) => jobDoc._id);

      let success;
      if (ids.length > 0) {
        await Jobs.removeJobs(ids);
        success = `Removed ${ids.length} old jobs`;
      } else {
        success = "No eligible jobs to cleanup";
      }
      job.done(success, { repeatId: true });
      Logger.debug(`${jobType}: finished`);
      return callback();
    });

    new Job(Jobs, jobType, {})
      .retry(jobRetryOptions)
      .repeat({
        schedule: Jobs.later.parse.text(jobFrequency)
      })
      .save({
        cancelRepeats: true
      });
  });
}
