import upsertPackages from "./util/upsertPackages.js";

/**
 * @summary Called on startup
 * @param {Object} context Startup context
 * @returns {undefined}
 */
export default async function startup(context) {
  await upsertPackages(context);
}
