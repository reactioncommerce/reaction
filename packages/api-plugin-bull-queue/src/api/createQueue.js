import { createRequire } from "module";
import Queue from "bull";
import ms from "ms";
import Logger from "@reactioncommerce/logger";
import config from "../config.js";

const require = createRequire(import.meta.url);

const pkg = require("../../package.json");

const { name, version } = pkg;
const logCtx = {
  name,
  version,
  file: "api/createQueue.js"
};


const {
  JOBS_SERVER_REMOVE_COMPLETED_JOBS_AFTER,
  JOBS_SERVER_REMOVE_FAILED_JOBS_AFTER
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
  if (!options.url) options.url = REDIS_SERVER;
  const newQueue = new Queue(queueName, options.url, options);
  context.bullQueue.jobQueues[queueName] = newQueue;
  newQueue.process((job) => processorFn(job.data));
  newQueue.on("error", (error) => {
    Logger.error({ error, queueName, ...logCtx }, "Error processing background job");
  });
  return newQueue;
}
