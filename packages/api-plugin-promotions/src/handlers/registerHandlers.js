import handlePromotionChangedState from "./handlePromotionChangedState.js";

/**
 * @summary Register handlers for promotion events
 * @param {Object} context - The per-request application context
 * @returns {undefined} undefined
 */
export default function registerOffersHandlers(context) {
  const { appEvents } = context;
  appEvents.on("promotionActivated", () => handlePromotionChangedState(context));
  appEvents.on("promotionCompleted", () => handlePromotionChangedState(context));
}
