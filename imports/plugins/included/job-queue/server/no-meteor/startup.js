import Logger from "@reactioncommerce/logger";
import { Jobs } from "./jobs";
import removeOldJobs from "./removeOldJobs";
import { jobCleanupRequests } from "./registration";

/**
 * @name startup
 * @summary Called on startup
 * @param {Object} context App context
 * @returns {undefined}
 */
export default async function startup(context) {
  const { appEvents, collections: { Jobs: MongoJobsCollection } } = context;
  Jobs.setCollection(MongoJobsCollection);

  if (process.env.VERBOSE_JOBS) {
    Jobs.setLogStream(process.stdout);
  }

  // Register cleanup jobs for various job types, as requested by other plugins
  jobCleanupRequests.forEach(removeOldJobs);

  Jobs.startJobServer(() => {
    Logger.debug("JobServer started");
    appEvents.emit("jobServerStart");
  });
}
