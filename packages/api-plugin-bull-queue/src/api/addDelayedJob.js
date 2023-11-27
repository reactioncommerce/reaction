import Logger from "@reactioncommerce/logger";
import pkg from "../../package.json" assert { type: "json" };


const { name, version } = pkg;
const logCtx = {
  name,
  version,
  file: "api/addDelayedJob.js"
};

/**
 * @summary add a job that is to be done x ms later
 * @param {Object} context - The application context
 * @param {String} queueName - The queue to add the job to
 * @param {Number} delayInMs - The delay in ms
 * @param {Object} jobData - Data to send to the job processor
 * @return {Promise<Object>|{Boolean}} - The job instance or false
 */
export default function addDelayedJob(context, queueName, delayInMs, jobData) {
  if (context.bullQueue.jobQueues[queueName]) {
    Logger.info({ queueName, delayInMs, ...logCtx }, "Adding Delayed job");
    return context.bullQueue.jobQueues[queueName].add(jobData, { delay: delayInMs });
  }
  Logger.error(logCtx, "Cannot add job to queue as it does not exist. You must call createQueue first");
  return false;
}
