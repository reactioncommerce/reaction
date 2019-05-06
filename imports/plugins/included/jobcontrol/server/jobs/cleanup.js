import Logger from "@reactioncommerce/logger";
import appEvents from "/imports/node-app/core/util/appEvents";
import { Job, Jobs } from "/imports/utils/jobs";

let moment;
async function lazyLoadMoment() {
  if (moment) return;
  moment = await import("moment").default;
}

/**
 * @summary Adds a "jobServerStart" event consumer, which registers
 *   a job to remove stale jobs.
 * @returns {undefined}
 */
export function addCleanupJobControlHook() {
  appEvents.on("jobServerStart", () => {
    Logger.debug("Adding Job jobControl/removeStaleJobs to JobControl");

    new Job(Jobs, "jobControl/removeStaleJobs", {})
      .retry({
        retries: 5,
        wait: 60000,
        backoff: "exponential"
      })
      .repeat({
        schedule: Jobs.later.parse.text("every day")
      })
      .save({
        cancelRepeats: true
      });
  });
}

export function cleanupJob() {
  const removeStaleJobs = Jobs.processJobs("jobControl/removeStaleJobs", {
    pollInterval: 60 * 60 * 1000, // backup polling, see observer below
    workTimeout: 60 * 1000
  }, (job, callback) => {
    Logger.debug("Processing jobControl/removeStaleJobs...");

    // TODO: set this interval in the admin UI
    Promise.await(lazyLoadMoment());
    const olderThan = moment().subtract(3, "days")._d;

    const ids = Jobs.find({
      type: {
        $nin: ["sendEmail"]
      },
      status: {
        $in: ["cancelled", "completed", "failed"]
      },
      updated: {
        $lt: olderThan
      }
    }, {
      fields: {
        _id: 1
      }
    }).map((d) => d._id);

    let success;
    if (ids.length > 0) {
      Jobs.removeJobs(ids);
      success = `Removed ${ids.length} stale jobs`;
      Logger.debug(success);
    } else {
      success = "No eligible jobs to cleanup";
      Logger.debug(success);
    }
    job.done(success, { repeatId: true });
    return callback();
  });

  Jobs.find({
    type: "jobControl/removeStaleJobs",
    status: "ready"
  }).observe({
    added() {
      return removeStaleJobs.trigger();
    }
  });
}
