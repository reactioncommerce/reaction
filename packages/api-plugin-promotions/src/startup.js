import { createRequire } from "module";
import Logger from "@reactioncommerce/logger";
import setPromotionState from "./watchers/setPromotionState.js";
import config from "./config.js";

const { REACTION_WORKERS_ENABLED } = config;


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
  if (!REACTION_WORKERS_ENABLED) {
    return false;
  }
  const { bullQueue } = context;
  await bullQueue.createQueue(context, "setPromotionState", {}, setPromotionState(context));
  await bullQueue.scheduleJob(context, "setPromotionState", "checkForChangedStates", {}, "*/5 * * * *");
  Logger.info(logCtx, "Add setPromotionState queue and job");
  return true;
}
