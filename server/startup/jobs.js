import { Jobs } from "/lib/collections";
import { Logger } from "/server/api";

/**
 * JobCollection Workers
 */

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
          const success = "Latest exchange rates was fetched successfully.";
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
          const success = "Too old exchange rates was flushed.";
          Logger.info(success);
          job.done(success, { repeatId: true });
        }
      });
      callback();
    }
  );
}
