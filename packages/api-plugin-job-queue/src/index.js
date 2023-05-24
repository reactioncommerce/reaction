import pkg from "../package.json" assert { type: "json" };
import { addWorker, cancelJobs, getJob, scheduleJob } from "./api.js";
import { registerPluginHandlerForJobQueue } from "./registration.js";
import shutdown from "./shutdown.js";
import startup from "./startup.js";

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {ReactionAPI} app The ReactionAPI instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "Job Queue",
    name: "job-queue",
    version: pkg.version,
    functionsByType: {
      registerPluginHandler: [registerPluginHandlerForJobQueue],
      shutdown: [shutdown],
      startup: [startup]
    },
    collections: {
      Jobs: {
        name: "Jobs",
        indexes: [
          [{ status: 1 }],
          [{ type: 1, status: 1 }],
          [{ priority: 1, retryUntil: 1, after: 1 }]
        ]
      }
    },
    contextAdditions: {
      backgroundJobs: {
        addWorker,
        cancelJobs,
        getJob,
        scheduleJob
      }
    }
  });
}
