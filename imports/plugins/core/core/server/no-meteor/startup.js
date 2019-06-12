import loadSampleData from "./util/loadSampleData";

/**
 * @summary Called on startup
 * @param {Object} context Startup context
 * @returns {undefined}
 */
export default async function startup(context) {
  await loadSampleData(context);
}
