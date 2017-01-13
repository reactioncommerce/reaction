import { Jobs, Packages } from "/lib/collections";
import { Hooks, Logger, Reaction } from "/server/api";


// helper to fetch shippo config
function getJobConfig() {
  return Packages.findOne({
    name: "reaction-shippo",
    shopId: Reaction.getShopId()
  }).settings;
}

// add job hook for "shippo/fetchTrackingStatusOfOrders"
Hooks.Events.add("afterCoreInit", () => {
  const config = getJobConfig();

  const refreshPeriod = config.refreshPeriod;

  if (!config.shippo.enabled || !refreshPeriod) {
    return;
  }

  Logger.info(`Adding shippo/fetchTrackingStatusForOrders to JobControl. Refresh ${refreshPeriod}`);
  new Job(Jobs, "shippo/fetchTrackingStatusForOrdersJob", {})
    .priority("normal")
    .retry({
      retries: 5,
      wait: 60000,
      backoff: "exponential" // delay by twice as long for each subsequent retry
    })
    .repeat({
      schedule: Jobs.later.parse.text(refreshPeriod)
    })
    .save({
      // Cancel any jobs of the same type,
      // but only if this job repeats forever.
      cancelRepeats: true
    });
});


export default function () {
  Jobs.processJobs(
    "shippo/fetchTrackingStatusForOrdersJob",
    {
      pollInterval: 30 * 1000,
      workTimeout: 180 * 1000
    },
    (job, callback) => {
      Meteor.call("shippo/fetchTrackingStatusForOrders", error => {
        if (error) {
          job.done(error.toString(), { repeatId: true });
        } else {
          const success = "Latest Shippo's Tracking Status of Orders fetched successfully.";
          Logger.info(success);
          job.done(success, { repeatId: true });
        }
      });
      callback();
    }
  );
}
