import { createRequire } from "module";
import Logger from "@reactioncommerce/logger";
import setPromotionState from "./watchers/setPromotionState.js";
import saveListOfCarts from "./utils/resaveListOfCarts.js";

const require = createRequire(import.meta.url);

const pkg = require("../package.json");

const { name, version } = pkg;
const logCtx = {
  name,
  version,
  file: "promotions/startup.js"
};

/**
 * @summary create promotion state working and job
 * @param {Object} context - The application context
 * @return {Boolean} - true if success
 */
export default async function startupPromotions(context) {
  const { bullQueue } = context;
  await bullQueue.createQueue(context, "setPromotionState", {}, setPromotionState(context));
  await bullQueue.scheduleJob(context, "setPromotionState", "checkForChangedStates", {}, "*/1 * * * *");
  Logger.info(logCtx, "Add setPromotionState queue and job");
  await bullQueue.createQueue(context, "checkExistingCarts", {}, saveListOfCarts(context));
  return true;
}
