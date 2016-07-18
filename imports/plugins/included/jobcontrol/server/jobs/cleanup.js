import { Jobs } from "/lib/collections";
import { Hooks, Logger } from "/server/api";

if (Hooks) {
  Hooks.Events.add("afterCoreInit", () => {
    Logger.info("Adding Jobs cleanup job to JobControl");
    new Job(Jobs, "cleanup", {}).repeat({
      schedule: Jobs.later.parse.text("every 1 minutes")
    }).save({
      cancelRepeats: true
    });
  });
}

function getJobIds() {
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
  Jobs.processJobs("cleanup", {pollInterval: false, workTimeout: 60 * 1000}, function (job, cb) {
    Logger.info("=======> Running cleanup Job");
    let current = new Date();
    current.setMinutes(current.getMinutes() - 60);
    const ids = getJobIds();
    if (ids.length > 0) {
      Jobs.removeJobs(ids);
    }
    const success = `Removed ${ds.length} stale jobs`;
    Logger.info(success);
    job.done(success, { repeatId: true });
    return cb();
  });
}
