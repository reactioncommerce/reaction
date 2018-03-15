import { Meteor } from "meteor/meteor";
import { Job } from "/imports/plugins/core/job-collection/lib";
import { Jobs, Packages } from "/lib/collections";
import { Hooks, Logger, Reaction } from "/server/api";

//
// helper to fetch reaction-taxes config
//
function getJobConfig() {
  const config = Packages.findOne({
    name: "taxes-taxcloud",
    shopId: Reaction.getShopId()
  });
  return config.settings.taxcloud;
}

//
// add job hook for "taxes/fetchTaxCloudTaxCodes"
//
Hooks.Events.add("afterCoreInit", () => {
  const config = getJobConfig();
  const refreshPeriod = config.refreshPeriod || 0;
  const taxCodeUrl = config.taxCodeUrl || "https://taxcloud.net/tic/?format=json";

  // set 0 to disable fetchTIC
  if (refreshPeriod !== 0) {
    Logger.debug(`Adding taxcloud/getTaxCodes to JobControl. Refresh ${refreshPeriod}`);
    new Job(Jobs, "taxcloud/getTaxCodes", { url: taxCodeUrl })
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
  }
});

//
// index imports and
// will trigger job to run
// taxes/fetchTaxCloudTaxCodes
//
export default function () {
  Jobs.processJobs(
    "taxcloud/getTaxCodes",
    {
      pollInterval: 30 * 1000,
      workTimeout: 180 * 1000
    },
    (job, callback) => {
      Meteor.call("taxcloud/getTaxCodes", (error) => {
        if (error) {
          if (error.error === "notConfigured") {
            Logger.warn(error.message);
            job.done(error.message, { repeatId: true });
          } else {
            job.done(error.toString(), { repeatId: true });
          }
        } else {
          // we should always return "completed" job here, because errors are fine
          const success = "Latest TaxCloud TaxCodes were fetched successfully.";
          Reaction.Importer.flush();
          Logger.debug(success);

          job.done(success, { repeatId: true });
        }
      });
      callback();
    }
  );
}
