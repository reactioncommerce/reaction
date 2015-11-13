/**
 * JobCollection Workers
 */

const fetchCurrencyRatesQueue = Jobs.processJobs(
  "shop/fetchCurrencyRates",
  {
    pollInterval: 30 * 1000,
    workTimeout: 180 * 1000
  },
  (job, callback) => {
    Meteor.call("shop/fetchCurrencyRate", error => {
      if (error) {
        if (error.error === "notConfigured") {
          ReactionCore.Log.warn(error.message);
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
        ReactionCore.Log.info(success);
        job.done(success, { repeatId: true });
      }
    });
    callback();
  }
);

const flushCurrencyRatesQueue = Jobs.processJobs(
  "shop/flushCurrencyRates",
  {
    pollInterval:/* 60 **/ 60 * 1000, // How often to ask the remote job Collection for
    // more work, in ms. Every hour will be fine here I suppose. // todo uncomment 60 *
    workTimeout: 180 * 1000
  },
  (job, callback) => {
    Meteor.call("shop/flushCurrencyRate", error => {
      if (error) {
        if (error.error === "notExists") {
          ReactionCore.Log.warn(error.message);
          job.done(error.message, { repeatId: true });
        } else {
          // ReactionCore.Log.error(error.toString());
          job.done(error.toString(), { repeatId: true });
        }
      } else {
        // https://github.com/vsivsi/meteor-job-collection#set-how-many-times-this
        // -job-will-be-automatically-re-run-by-the-job-collection
        const success = "Too old exchange rates was flushed.";
        ReactionCore.Log.info(success);
        job.done(success, { repeatId: true });
      }
    });
    callback();
  }
);
