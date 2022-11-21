import Logger from "@reactioncommerce/logger";
import setPromotionState from "./watchers/setPromotionState.js";

/**
 * @summary create promotion state working and job
 * @param {Object} context - The application context
 * @return {Promise<{job: Job, workerInstance: Job}>} - worker instance and job
 */
export default async function startupPromotions(context) {
  const workerInstance = await context.backgroundJobs.addWorker({
    type: "setPromotionState",
    async worker(job) {
      await setPromotionState(context, job.data); // Whatever function you create that does the task
      job.done("Promotion state update");
      // If anything throws, it will automatically call job.fail(errorMessage), but you
      // could also call job.fail yourself to provide better failure details.
    }
  });

  const job = await context.backgroundJobs.scheduleJob({
    type: "setPromotionState",
    data: {}, // any data your worker needs to perform the work
    priority: "normal",
    // Schedule is optional if you just need to run it once.
    // Set to any text that later.js can parse.
    schedule: "every 30 seconds",
    // Set cancelRepeats to true if you want to cancel all other pending jobs with the same type
    cancelRepeats: true
  });

  Logger.info("registered worker and job");
  return { workerInstance, job };
}
