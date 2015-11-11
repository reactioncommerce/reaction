/**
 * Cron Jobs
 */

const fetchCurrencyRatesQueue = Jobs.processJobs(
  "shop/fetchCurrencyRates",
  (job, callback) => {
    Meteor.call("shop/fetchCurrencyRate", error => {
      if (error) {
        if (error.message === 'notConfigured') {
          const message = "Open Exchange Rates AppId not configured. Configure for current rates.";
          ReactionCore.Log.warn(message);
          //job.fail(message);
          job.done(message, { repeatId: true });
        } else {
          //job.fail(error);
          job.done(error, { repeatId: true });
        }
      } else {
        // we should always return "completed" job here, because errors are fine
        // result for this task, so that's why we show message if error happens
        // and return job.done();
        // you can read more about job.repeat() here:
        // https://github.com/vsivsi/meteor-job-collection#set-how-many-times-this
        // -job-will-be-automatically-re-run-by-the-job-collection
        const success = "Fresh exchange rates was fetched successfully.";
        ReactionCore.Log.info(success);
        job.done(success, { repeatId: true });
      }
    });
    callback();
  }
);

const fetchCurrencyRatesJob = new Job(Jobs, "shop/fetchCurrencyRates", {})
  .priority("normal")
  .repeat({
    schedule: Jobs.later.parse.text("every 30 seconds")
  })
  .save({
    // Cancel any jobs of the same type,
    // but only if this job repeats forever.
    // Default: false.
    cancelRepeats: true
  });

const flushCurrencyRatesQueue = Jobs.processJobs(
  "shop/flushCurrencyRates",
  (job, callback) => {
    Meteor.call("shop/flushCurrencyRate", error => {
      if (error) {
        job.done(error, { repeatId: true });
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

const flushCurrencyRatesJob = new Job(Jobs, "shop/flushCurrencyRates", {})
  .priority("normal")
  .repeat({
    schedule: Jobs.later.parse.text("every 30 seconds")
  })
  .save({
    // Cancel any jobs of the same type,
    // but only if this job repeats forever.
    // Default: false.
    cancelRepeats: true
  });
