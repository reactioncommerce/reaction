import checkAndSeedDb from "./util/checkAndSeedDb.js";

/**
 * @summary Called before startup
 * @param {Object} context Startup context
 * @returns {undefined}
 */
export default async function simpleSchemaPreStartup(context) {
  await checkAndSeedDb(context);
}
