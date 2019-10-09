import Logger from "@reactioncommerce/logger";
import { Jobs } from "./jobs.js";

/**
 * @name shutdown
 * @summary Called on shutdown
 * @param {Object} context App context
 * @returns {undefined}
 */
export default function shutdown() {
  return new Promise((resolve, reject) => {
    try {
      Jobs.shutdownJobServer(() => {
        Logger.debug("Background job system stopped");
        resolve();
      });
    } catch (error) {
      reject(error);
    }
  });
}
