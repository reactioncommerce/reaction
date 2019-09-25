import Logger from "@reactioncommerce/logger";
import { Job, Jobs } from "./jobs";

/**
 * @summary Add a worker for a background job type
 * @param {Object} options Worker options
 * @param {Number} [options.pollInterval] How frequently to poll for work. Default 1 hour.
 * @param {String} options.type The job type to work.
 * @param {Function} options.worker The worker function. This is passed a single argument,
 *   the job instance. You must call job.done() when done or call job.fail(msg) if there is an error.
 * @param {Number} [options.workTimeout] Milliseconds after which to fail the job if
 *   job.done has not yet been called. Default 1 minute.
 * @return {Promise<Job>} A promise that resolves with the worker instance
 */
export function addWorker(options) {
  const {
    pollInterval = 60 * 60 * 1000, // default 1 hour
    type,
    worker,
    workTimeout = 60 * 1000 // default 1 minute
  } = options;

  return new Promise((resolve, reject) => {
    Jobs.whenReady(() => {
      try {
        const jobWorker = Jobs.processJobs(type, {
          pollInterval, // backup polling, see observer below
          workTimeout
        }, async (job, callback) => {
          Logger.debug(`${type}: started`);

          try {
            // Worker must call job.done when done, and may call job.fail on errors
            await worker(job);
          } catch (error) {
            job.fail(error.message);
          }

          Logger.debug(`${type}: finished`);
          return callback();
        });

        Jobs.find({ type, status: "ready" }).observe({
          added() {
            return jobWorker.trigger();
          }
        });
        resolve(jobWorker);
      } catch (error) {
        reject(error);
      }
    });
  });
}

/**
 * @summary Get a single job instance.
 * @param {String} id Job ID
 * @return {Promise<undefined>} Nothing
 */
export function getJob(id) {
  return new Promise((resolve, reject) => {
    try {
      Jobs.whenReady(async () => {
        Jobs.getJob(id).then(resolve).catch(reject);
      });
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * @summary Cancel one or more repeating jobs that match a filter and are not
 *   yet completed, canceled, or failed.
 * @param {Object} filter Object with `type` and optionally `data` to
 *   filter which jobs should be canceled.
 * @return {Promise<undefined>} Nothing
 */
export function cancelJobs(filter) {
  return new Promise((resolve, reject) => {
    try {
      Jobs.whenReady(async () => {
        const existingJobs = await Jobs.find({
          ...filter,
          status: {
            $in: this.jobStatusCancellable
          }
        }).toArray();

        await Promise.all(existingJobs.map((doc) => Jobs._DDPMethod_jobCancel(doc._id, {})));

        resolve();
      });
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * @summary Schedule a background job
 * @param {Object} options Job options
 * @param {Boolean} [options.cancelRepeats=false] Upon scheduling, cancel all jobs
 *   with the same type that aren't complete or failed yet.
 * @param {String} [options.priority] Priority
 * @param {Object} [options.retry] Retry options
 * @param {String} [options.schedule] A schedule string that later.js understands
 * @param {String} options.type The job type. Determines which worker will work
 *   the job.
 * @return {Promise<Job>} A promise that resolves with the job instance
 */
export function scheduleJob(options) {
  const {
    cancelRepeats = false,
    data,
    priority,
    retry,
    schedule,
    type
  } = options;

  return new Promise((resolve, reject) => {
    Jobs.whenReady(() => {
      try {
        const job = new Job(Jobs, type, data);

        if (priority) job.priority(priority);
        if (retry) job.retry(retry);
        if (schedule) job.repeat({ schedule: Jobs.later.parse.text(schedule) });

        job
          .save({ cancelRepeats })
          .then(() => {
            resolve(job);
            return;
          })
          .catch(reject);
      } catch (error) {
        reject(error);
      }
    });
  });
}
