import pkg from "../package.json"
import startup from "./startup.js";


/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {Object} app The ReactionAPI instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "Bull Job Queue Client",
    name: "bull-job-queue-client",
    version: pkg.version,
    functionsByType: {
      startup: [startup]
    }
  });
}
