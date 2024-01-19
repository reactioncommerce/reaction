import pkg from "../package.json" assert { type: "json" };
import shutdown from "./shutdown.js";
import api from "./api/index.js";

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {Object} app The ReactionAPI instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "Bull Job Queue",
    name: "bull-job-queue",
    version: pkg.version,
    functionsByType: {
      shutdown: [shutdown]
    },
    contextAdditions: {
      bullQueue: {
        jobQueues: {},
        ...api
      }
    }
  });
}
