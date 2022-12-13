import handlePromotionChangedState from "./handlePromotionChangedState.js";

/**
 * @summary Register handlers for promotion events
 * @param {Object} context - The per-request application context
 * @returns {undefined} undefined
 */
export default function registerOffersHandlers(context) {
  const { appEvents } = context;
  appEvents.on("promotionActivated", (args) => handlePromotionChangedState(context, args));
  appEvents.on("promotionCompleted", (args) => handlePromotionChangedState(context, args));
}
