import Logger from "@reactioncommerce/logger";
import config from "./config.js";
import { Jobs } from "./jobs.js";
import removeOldJobs from "./removeOldJobs.js";
import { jobCleanupRequests } from "./registration.js";

/**
 * @name startup
 * @summary Called on startup
 * @param {Object} context App context
 * @returns {undefined}
 */
export default async function jobQueueStartup(context) {
  const { appEvents, collections: { Jobs: MongoJobsCollection } } = context;
  Jobs.setCollection(MongoJobsCollection);

  if (config.VERBOSE_JOBS) {
    Jobs.setLogStream(process.stdout);
  }

  // Register cleanup jobs for various job types, as requested by other plugins
  jobCleanupRequests.forEach(removeOldJobs);

  Jobs.startJobServer(() => {
    Logger.debug("Background job system started");
    appEvents.emit("jobServerStart");
  });
}
