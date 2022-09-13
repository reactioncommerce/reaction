import handlePromotionActionTriggered from "./handlePromotionActionTriggered.js";
import handleCartPromotionsAnalysisComplete from "./handleCartPromotionsAnalysisComplete.js";
import handlePromotionsRemovedFromCart from "./handlePromotionsRemovedFromCart.js";

/**
 * @summary handle cart events
 * @param {Object} context - The per-request application context
 * @returns {undefined} undefined
 */
export default function registerHandlers(context) {
  const { appEvents } = context;
  appEvents.on("promotionActionTriggered", (params) => handlePromotionActionTriggered(context, params));
  appEvents.on("cartPromotionAnalysisComplete", (params) => handleCartPromotionsAnalysisComplete(context, params));
  appEvents.on("promotionsRemovedFromCart", (params) => handlePromotionsRemovedFromCart(context, params));
}
