import Logger from "@reactioncommerce/logger";
import { Job, Jobs } from "/imports/utils/jobs";
import appEvents from "/imports/node-app/core/util/appEvents";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import fetchCurrencyRate from "/imports/plugins/core/core/server/util/fetchCurrencyRate";
import flushCurrencyRate from "/imports/plugins/core/core/server/util/flushCurrencyRate";

/**
 * @summary Schedule fetching and flushing jobs
 * @returns {undefined}
 */
export function setupFetchFlushCurrencyHooks() {
  // While we don't necessarily need to wait for anything to add a job
  // in this case we need to have packages loaded so we can check for the OER API key
  appEvents.on("afterCoreInit", () => {
    const settings = Reaction.getShopSettings();
    const exchangeConfig = settings.openexchangerates || {};

    if (exchangeConfig.appId) {
      const refreshPeriod = exchangeConfig.refreshPeriod || "every 4 hours";
      Logger.debug(`Adding shop/fetchCurrencyRates to JobControl. Refresh ${refreshPeriod}`);
      new Job(Jobs, "shop/fetchCurrencyRates", {})
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

      // Run the first time immediately after server start. The repeat({schedule}) option via
      // later.js scheduling won't run before the first scheduled time, even with delay() or after()
      new Job(Jobs, "shop/fetchCurrencyRates", {})
        .retry({
          retries: 5,
          wait: 10000
        })
        .save();
    } else {
      Logger.warn("OpenExchangeRates API not configured. Not adding fetchRates job");
    }
  });

  appEvents.on("afterCoreInit", () => {
    const settings = Reaction.getShopSettings();
    const exchangeConfig = settings.openexchangerates || {};

    if (exchangeConfig.appId) {
      Logger.debug("Adding shop/flushCurrencyRates to JobControl");
      // TODO: Add this as a configurable option
      const refreshPeriod = "Every 24 hours";
      new Job(Jobs, "shop/flushCurrencyRates", {})
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
      Logger.warn("OpenExchangeRates API not configured. Not adding flushRates job");
    }
  });
}


/**
 * @summary Set up workers for "shop/fetchCurrencyRates" and "shop/flushCurrencyRates" jobs
 * @returns {undefined}
 */
export function fetchRateJobs() {
  const fetchCurrencyRates = Jobs.processJobs("shop/fetchCurrencyRates", {
    pollInterval: 60 * 60 * 1000, // backup polling, see observer below
    workTimeout: 180 * 1000
  }, (job, callback) => {
    try {
      fetchCurrencyRate();
    } catch (error) {
      if (error.error === "notConfigured") {
        Logger.error(error.message);
        job.done(error.message, { repeatId: true });
      } else {
        job.done(error.toString(), { repeatId: true });
      }
      callback();
      return;
    }
    // we should always return "completed" job here, because errors are fine
    // result for this task, so that's why we show message if error happens
    // and return job.done();
    // you can read more about job.repeat() here:
    // https://github.com/vsivsi/meteor-job-collection#set-how-many-times-this
    // -job-will-be-automatically-re-run-by-the-job-collection
    const success = "Latest exchange rates were fetched successfully.";
    Logger.debug(success);
    job.done(success, { repeatId: true });
    callback();
  });

  Jobs.find({
    type: "shop/fetchCurrencyRates",
    status: "ready"
  }).observe({
    added() {
      return fetchCurrencyRates.trigger();
    }
  });

  const flushCurrencyRates = Jobs.processJobs(
    "shop/flushCurrencyRates", {
      pollInterval: 60 * 60 * 1000, // backup polling, see observer below
      workTimeout: 180 * 1000
    },
    (job, callback) => {
      try {
        flushCurrencyRate();
      } catch (error) {
        if (error.error === "notExists") {
          Logger.error(error.message);
          job.done(error.message, { repeatId: true });
        } else {
          // Logger.error(error.toString());
          job.done(error.toString(), { repeatId: true });
        }
        callback();
        return;
      }
      // https://github.com/vsivsi/meteor-job-collection#set-how-many-times-this
      // -job-will-be-automatically-re-run-by-the-job-collection
      const success = "Stale exchange rates were flushed.";
      Logger.debug(success);
      job.done(success, { repeatId: true });
      callback();
    }
  );

  Jobs.find({
    type: "shop/flushCurrencyRates",
    status: "ready"
  }).observe({
    added() {
      return flushCurrencyRates.trigger();
    }
  });
}
