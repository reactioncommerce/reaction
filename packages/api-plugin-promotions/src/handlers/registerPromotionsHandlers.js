import handleQualifiedForPromotions from "./handleQualifiedForPromotions.js";
import handleCartPromotionsAnalysisComplete from "./handleCartPromotionAnalysisComplete.js";
import handlePromotionActionTriggered from "./handlePromotionActionTriggered.js";

/**
 * @summary handle cart events
 * @param {Object} context - The per-request application context
 * @returns {undefined} undefined
 */
export default function registerPromotionsHandlers(context) {
  const { appEvents } = context;
  appEvents.on("qualifiedForPromotion", (params) => handleQualifiedForPromotions(context, params));
  appEvents.on("cartPromotionAnalysisComplete", (params) => handleCartPromotionsAnalysisComplete(context, params));
  appEvents.on("promotionActionTriggered", (params) => handlePromotionActionTriggered(context, params));
}
