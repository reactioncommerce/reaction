import pkg from "../package.json" assert { type: "json" };
import loadSampleData from "./startup.js";

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {Object} app The ReactionAPI instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "Sample Data",
    name: "sample-data",
    version: pkg.version,
    functionsByType: {
      startup: [loadSampleData]
    }
  });
}
