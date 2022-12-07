import { createRequire } from "module";
import Logger from "@reactioncommerce/logger";
import setPromotionState from "./watchers/setPromotionState.js";


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
 * @return {Promise<{job: Job, workerInstance: Job}>} - worker instance and job
 */
export default async function startupPromotions(context) {
  const { bullQueue } = context;
  bullQueue.createQueue(context, "setPromotionState", {}, setPromotionState(context));
  bullQueue.scheduleJob(context, "setPromotionState", {}, "*/5 * * * *");
  Logger.info(logCtx, "Add setPromotionState queue and job");
}
