import { Jobs, Packages } from "/lib/collections";
import { Hooks, Logger, Reaction } from "/server/api";


// helper to fetch shippo config
function getJobConfig() {
  return Packages.findOne({
    name: "reaction-shippo",
    shopId: Reaction.getShopId()
  }).settings;
}

// add job hook for "shippo/fetchTrackingStatuses"
Hooks.Events.add("afterCoreInit", () => {
  const config = getJobConfig();

  const refreshPeriod = config.refreshPeriod;

  if (!config.shippo.enabled || !refreshPeriod) {
    return;
  }

  Logger.info(`Adding shippo/fetchTrackingStatuses to JobControl. Refresh ${refreshPeriod}`);
  new Job(Jobs, "shippo/fetchTrackingStatusesJob")
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

//
// index imports and
// will trigger job to run
// taxes/fetchTaxCloudTaxCodes
//
export default function () {
  Jobs.processJobs(
    "shippo/fetchTrackingStatusesJob",
    {
      pollInterval: 30 * 1000,
      workTimeout: 180 * 1000
    },
    (job, callback) => {
      Meteor.call("shippo/fetchTrackingStatuses", error => {
        if (error) {
          if (error.error === "notConfigured") {
            Logger.warn(error.message);
            job.done(error.message, { repeatId: true });
          } else {
            job.done(error.toString(), { repeatId: true });
          }
        } else {
          // we should always return "completed" job here, because errors are fine
          const success = "Latest Shippo's Tracking Statuses fetched successfully.";
          Reaction.Import.flush();
          Logger.info(success);

          job.done(success, { repeatId: true });
        }
      });
      callback();
    }
  );
}
