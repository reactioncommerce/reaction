import returnEmailProcessor from "./util/returnEmailProcessor.js";

/**
 * @summary Called on startup
 * @param {Object} context Startup context
 * @param {Object} context.collections Map of MongoDB collections
 * @returns {undefined}
 */
export default async function emailStartup(context) {
  const { bullQueue } = context;
  bullQueue.createQueue(context, "sendEmail", {}, returnEmailProcessor(context));
}
