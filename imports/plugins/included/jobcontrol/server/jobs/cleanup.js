import { Job } from "/imports/plugins/core/job-collection/lib";
import { Jobs } from "/lib/collections";
import { Hooks, Logger } from "/server/api";

let moment;
async function lazyLoadMoment() {
  if (moment) return;
  moment = await import("moment");
}

export function addCleanupJobControlHook() {
  Hooks.Events.add("onJobServerStart", () => {
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
