import { createRequire } from "module";
import Logger from "@reactioncommerce/logger";


const require = createRequire(import.meta.url);

const pkg = require("../../package.json");

const { name, version } = pkg;
const logCtx = {
  name,
  version,
  file: "api/addJob.js"
};

/**
 * @summary add a job to a named queue
 * @param {Object} context - The application context
 * @param {String} queueName - The queue to add the job to
 * @param {Object} jobData - Data the job uses to process
 * @return {Promise<Object>|{Boolean}} - The job instance or false
 */
export default function addJob(context, queueName, jobData) {
  Logger.info({ queueName, ...logCtx }, "Added job to queue");
  if (context.bullQueue.jobQueues[queueName]) {
    Logger.info({ queueName, ...logCtx }, "Adding job");
    return context.bullQueue.jobQueues[queueName].add(jobData);
  }
  Logger.error(logCtx, "Cannot add job to queue as it does not exist. You must call createQueue first");
  return false;
}
