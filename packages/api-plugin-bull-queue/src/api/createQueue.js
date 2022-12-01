import { createRequire } from "module";
import Queue from "bull";
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

const { REDIS_SERVER } = config;

/**
 * @summary create a new named instance of the BullMQ Queue
 * @param {Object} context - The application context
 * @param {String} queueName - The name of the queue to create, this name is used elsewhere to reference the queue
 * @param {Object} options - Any additional options to pass to the instance
 * @param {Function} processorFn - The processor function to use for jobs in the queue
 * @return {Object} - An instance of BullMQ
 */
export default function createQueue(context, queueName, options, processorFn) {
  Logger.info({ queueName, ...logCtx }, "Creating queue");
  if (!options.url) options.url = REDIS_SERVER;
  const newQueue = new Queue(queueName, options.url, options);
  context.bullQueue.jobQueues[queueName] = newQueue;
  newQueue.process((job) => processorFn(job.data));
  return newQueue;
}
