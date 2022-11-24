import Logger from "@reactioncommerce/logger";

/**
 * @name shutdown
 * @summary Called on shutdown
 * @param {Object} context App context
 * @returns {undefined}
 */
export default function jobQueueShutdown(context) {
  Logger.info("Shutting down bull queue jobs server");
  return new Promise((resolve, reject) => {
    try {
      const queues = context.bullQueue.jobQueues;
      if (queues.length) {
        for (const queue of queues) {
          queue.close().then(() => {
            console.log("done");
          }).catch((error) => console.error(error));
        }
      }
    } catch (error) {
      reject(error);
    }
  });
}
