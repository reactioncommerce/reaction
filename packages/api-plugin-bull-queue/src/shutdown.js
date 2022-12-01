import { createRequire } from "module";
import Logger from "@reactioncommerce/logger";

const require = createRequire(import.meta.url);

const pkg = require("../package.json");

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
 * @returns {undefined}
 */
export default function bullQueueShutdown(context) {
  Logger.info("Shutting down bull queue jobs server");
  return new Promise((resolve, reject) => {
    try {
      const queues = context.bullQueue.jobQueues;
      if (queues.length) {
        for (const queue of queues) {
          queue.close().then(() => Logger.info(logCtx, "Closed queue")).catch((error) => Logger.error(logCtx, error));
        }
      }
    } catch (error) {
      reject(error);
    }
  });
}
