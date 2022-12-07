import returnEmailProcessor from "./util/returnEmailProcessor.js";
import config from "./config.js";

const { REACTION_WORKERS_ENABLED } = config;
/**
 * @summary Called on startup
 * @param {Object} context Startup context
 * @param {Object} context.collections Map of MongoDB collections
 * @returns {undefined}
 */
export default async function emailStartup(context) {
  if (!REACTION_WORKERS_ENABLED) return;
  const { bullQueue } = context;
  bullQueue.createQueue(context, "sendEmail", {}, returnEmailProcessor(context));
}
