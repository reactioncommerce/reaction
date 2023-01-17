import checkAndSeedDb from "./util/checkAndSeedDb.js";
import dbVersionCheck from "./util/dbVersionCheck.js";

/**
 * @summary Called before startup
 * @param {Object} context Startup context
 * @returns {undefined}
 */
export default async function simpleSchemaPreStartup(context) {
  await checkAndSeedDb(context);
  await dbVersionCheck(context);
}
