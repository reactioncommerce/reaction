import { Jobs } from "/lib/collections";
import { Hooks, Logger } from "/server/api";

Hooks.Events.add("onJobServerStart", () => {
  Logger.info("Adding Job jobControl/removeStaleJobs to JobControl");
  new Job(Jobs, "jobControl/removeStaleJobs", {})
    .priority("normal")
    .retry({
      retries: 5,
      wait: 60000,
      backoff: "exponential"
    })
    .repeat({
      schedule: Jobs.later.parse.text("every 15 minutes")
    })
    .save({
      cancelRepeats: true
    });
});


function getJobIds(current) {
  const ids = Jobs.find({
    status: {
      $in: Job.jobStatusRemovable
    },
    updated: {
      $lt: current
    }
  }, {
    fields: {
      _id: 1
    }
  }).map(function (d) {
    return d._id;
  });
  return ids;
}

export default function () {
  Jobs.processJobs("jobControl/removeStaleJobs",
    {
      pollInterval: 30 * 1000,
      workTimeout: 60 * 1000
    },
    (job, callback) => {
      let current = new Date();
      // todo: set this interval in the admin UI
      current.setMinutes(current.getMinutes() - 5);
      const ids = getJobIds(current);
      let success;
      if (ids.length > 0) {
        Jobs.removeJobs(ids);
        success = `Removed ${ids.length} stale jobs`;
        Logger.info(success);
      } else {
        success = "No eligible jobs to cleanup";
        Logger.info(success);
      }
      job.done(success, { repeatId: true });
      return callback();
    });
}
