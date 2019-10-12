import loadSampleData from "./util/loadSampleData.js";
import upsertPackages from "./util/upsertPackages.js";

/**
 * @summary Called on startup
 * @param {Object} context Startup context
 * @returns {undefined}
 */
export default async function startup(context) {
  await loadSampleData(context);
  await upsertPackages(context);
}
