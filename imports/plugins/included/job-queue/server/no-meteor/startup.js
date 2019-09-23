import Logger from "@reactioncommerce/logger";
import { Jobs } from "./jobs";

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

  Jobs.startJobServer(() => {
    Logger.debug("JobServer started");
    appEvents.emit("jobServerStart");
  });
}
