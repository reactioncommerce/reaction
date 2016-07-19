import { Jobs, Packages } from "/lib/collections";
import { Hooks, Logger, Reaction } from "/server/api";

function getJobConfig() {
  const config = Packages.findOne({
    name: "core",
    shopId: Reaction.getShopId()
  });
  return config;
}

// While we don't necessarily need to wait for anything to add a job
// in this case we need to have packages loaded so we can check for the OER API key
Hooks.Events.add("afterCoreInit", () => {
  const config = getJobConfig();
  let exchangeConfig;
  if (config) {
    exchangeConfig = config.settings.openexchangerates;
  }
  if (exchangeConfig && exchangeConfig.appId) {
    const refreshPeriod = exchangeConfig.refreshPeriod || "Every 4 hours";
    Logger.info(`Adding shop/fetchCurrencyRates to JobControl. Refresh ${refreshPeriod}`);
    new Job(Jobs, "shop/fetchCurrencyRates", {})
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
  } else {
    Logger.info("OpenExchangeRates API not configured. Not adding fetchRates job");
  }
});

Hooks.Events.add("afterCoreInit", () => {
  const config = getJobConfig();
  let exchangeConfig;
  if (config) {
    exchangeConfig = config.settings.openexchangerates;
  }
  if (exchangeConfig && exchangeConfig.appId) {
    Logger.info("Adding shop/flushCurrencyRates to JobControl");
    // TODO: Add this as a configurable option
    const refreshPeriod = "Every 24 hours";
    new Job(Jobs, "shop/flushCurrencyRates", {})
      .priority("normal")
      .retry({
        retries: 5,
        wait: 60000,
        backoff: "exponential"
      })
      .repeat({
        schedule: Jobs.later.parse.text(refreshPeriod)
      })
      .save({
        cancelRepeats: true
      });
  } else {
    Logger.info("OpenExchangeRates API not configured. Not adding flushRates job");
  }
});


export default function () {
  Jobs.processJobs(
    "shop/fetchCurrencyRates",
    {
      pollInterval: 30 * 1000,
      workTimeout: 180 * 1000
    },
    (job, callback) => {
      Meteor.call("shop/fetchCurrencyRate", error => {
        if (error) {
          if (error.error === "notConfigured") {
            Logger.warn(error.message);
            job.done(error.message, { repeatId: true });
          } else {
            job.done(error.toString(), { repeatId: true });
          }
        } else {
          // we should always return "completed" job here, because errors are fine
          // result for this task, so that's why we show message if error happens
          // and return job.done();
          // you can read more about job.repeat() here:
          // https://github.com/vsivsi/meteor-job-collection#set-how-many-times-this
          // -job-will-be-automatically-re-run-by-the-job-collection
          const success = "Latest exchange rates were fetched successfully.";
          Logger.info(success);
          job.done(success, { repeatId: true });
        }
      });
      callback();
    }
  );

  Jobs.processJobs(
    "shop/flushCurrencyRates",
    {
      pollInterval: 60 * 60 * 1000, // How often to ask the remote job Collection for
      // more work, in ms. Every hour will be fine here I suppose.
      workTimeout: 180 * 1000
    },
    (job, callback) => {
      Meteor.call("shop/flushCurrencyRate", error => {
        if (error) {
          if (error.error === "notExists") {
            Logger.warn(error.message);
            job.done(error.message, { repeatId: true });
          } else {
            // Logger.error(error.toString());
            job.done(error.toString(), { repeatId: true });
          }
        } else {
          // https://github.com/vsivsi/meteor-job-collection#set-how-many-times-this
          // -job-will-be-automatically-re-run-by-the-job-collection
          const success = "Stale exchange rates were flushed.";
          Logger.info(success);
          job.done(success, { repeatId: true });
        }
      });
      callback();
    }
  );
}
