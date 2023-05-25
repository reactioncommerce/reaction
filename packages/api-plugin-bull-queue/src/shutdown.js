import Logger from "@reactioncommerce/logger";
import pkg from "../package.json" assert { type: "json" };


const { name, version } = pkg;
const logCtx = {
  name,
  version,
  file: "shutdown.js"
};

/**
 * @name shutdown
 * @summary Called on shutdown
 * @param {Object} context App context
 * @returns {undefined} undefined
 */
export default async function bullQueueShutdown(context) {
  Logger.info(logCtx, "Shutting down bull queue jobs server");
  try {
    const queues = context.bullQueue.jobQueues;
    if (queues.length) {
      for (const queue of queues) {
        queue.close()
          .then(() => Logger.debug(logCtx, "Closed queue"))
          .catch((error) => Logger.error(logCtx, error));
      }
    }
    Logger.info(logCtx, "Shutdown complete");
  } catch (error) {
    Logger.error(error);
  }
}
