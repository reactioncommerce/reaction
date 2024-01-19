import Logger from "@reactioncommerce/logger";
import Queue from "bull";
import ms from "ms";
import pkg from "../../package.json" assert { type: "json" };
import config from "../config.js";


const { name, version } = pkg;
const logCtx = {
  name,
  version,
  file: "api/createQueue.js"
};


const {
  JOBS_SERVER_REMOVE_COMPLETED_JOBS_AFTER,
  JOBS_SERVER_REMOVE_FAILED_JOBS_AFTER,
  REACTION_WORKERS_ENABLED
} = config;


const defaultOptions = {
  removeOnComplete: { age: ms(JOBS_SERVER_REMOVE_COMPLETED_JOBS_AFTER) },
  removeOnFail: { age: ms(JOBS_SERVER_REMOVE_FAILED_JOBS_AFTER) }
};

const { REDIS_SERVER } = config;

/**
 * @summary create a new named instance of the BullMQ Queue
 * @param {Object} context - The application context
 * @param {String} queueName - The name of the queue to create, this name is used elsewhere to reference the queue
 * @param {Object} options - Any additional options to pass to the instance
 * @param {Function} processorFn - The processor function to use for jobs in the queue
 * @return {Object|Boolean} - An instance of a BullMQ queue
 */
export default function createQueue(context, queueName, options = defaultOptions, processorFn) {
  if (typeof queueName !== "string" || typeof options !== "object" || typeof processorFn !== "function") {
    Logger.error(logCtx, "Invalid parameters provided to create queue");
    return false;
  }
  Logger.info({ queueName, ...logCtx }, "Creating queue");
  const newQueue = new Queue(queueName, options.url ?? REDIS_SERVER, options);
  context.bullQueue.jobQueues[queueName] = newQueue;
  if (REACTION_WORKERS_ENABLED) { // If workers are not enabled, allow adding jobs to queue but don't process them
    if (options.jobName) {
      newQueue.process(options.jobName, (job) => processorFn(job.data, job));
    } else {
      newQueue.process((job) => processorFn(job.data, job));
    }
  }

  newQueue.on("error", (err) => {
    const error = `${err}`; // need to turn this info a string
    Logger.error({ error, queueName, ...logCtx }, "Error processing background job");
  });

  newQueue.on("stalled", (job) => {
    Logger.error({ queueName, options, job, ...logCtx }, "Job stalled");
  });

  newQueue.on("failed", (job, err) => {
    const error = `${err}`; // need to turn this info a string
    Logger.error({ error, ...logCtx }, "Job process failed");
  });
  return newQueue;
}
