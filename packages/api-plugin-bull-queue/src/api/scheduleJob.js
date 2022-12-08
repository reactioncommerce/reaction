import { createRequire } from "module";
import Logger from "@reactioncommerce/logger";

const require = createRequire(import.meta.url);

const pkg = require("../../package.json");

const { name, version } = pkg;
const logCtx = {
  name,
  version,
  file: "api/scheduleJob.js"
};


/**
 * @summary create a scheduled job
 * @param {Object} context - The application context
 * @param {String} queueName - The queue to add this job
 * @param {String} jobName - The unique name of the job
 * @param {Object} jobData - Data to be passed to the worker
 * @param {Object} schedule - The schedule as a crontab
 * @return {Boolean} - true if success
 */
export default async function scheduleJob(context, queueName, jobName, jobData, schedule) {
  if (typeof jobData !== "object" || typeof schedule !== "string") {
    Logger.error(logCtx, "Invalid parameters supplied to scheduleJob");
    return false;
  }
  if (context.bullQueue.jobQueues[queueName]) {
    const thisQueue = context.bullQueue.jobQueues[queueName];
    const repeatableJobs = await thisQueue.getRepeatableJobs();
    const jobToRemove = repeatableJobs.find((jbName) => jobName === jbName.name);
    if (jobToRemove) {
      await thisQueue.removeRepeatable(jobToRemove);
      Logger.info({ queueName, jobName, ...logCtx }, "Removed repeatable job");
    }
    await thisQueue.add(jobName, jobData, { repeat: { cron: schedule } });
    return true;
  }
  Logger.error({ queueName, ...logCtx }, "Could not schedule job as the queue was not found");
  return false;
}
