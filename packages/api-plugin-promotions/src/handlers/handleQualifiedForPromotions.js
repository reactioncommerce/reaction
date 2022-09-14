import Logger from "@reactioncommerce/logger";

const logCtx = { file: "handleQualifiedForPromotion" };

/**
 * @summary ensure no exclusions apply to the promotion
 * @param {Object} cart - The cart that this will be applied to
 * @param {Object} promotion - the promotion to be applied
 * @return {boolean} If the promotion can be applied
 */
function canBeApplied(cart, promotion) {
  if (!cart.appliedPromotions) {
    // no previous promotions, return true
    return true;
  }
  if (promotion.stackAbility === "none") {
    Logger.info(logCtx, "Cart disqualified from promotion by stackability");
    return false;
  }
  return true;
}


/**
 * @summary emit event for every qualified promotions
 * @param {Object} context - The application context
 * @param {Object} params - The passed parameters
 * @returns {Promise<void>} undefined
 */
export default async function qualifiedForPromotion(context, params) {
  const { appEvents } = context;
  const { promotion, cart } = params;
  const { actions } = promotion;
  if (canBeApplied(cart, promotion)) {
    for (const action of actions) {
      const { actionKey, actionParameters } = action;
      appEvents.emit("promotionActionTriggered", { actionKey, actionParameters, params });
    }
    if (cart.appliedPromotions) {
      cart.appliedPromotions.push(promotion);
    } else {
      cart.appliedPromotions = [promotion];
    }
    await context.mutations.saveCart(context, cart, "promotions");
  }
}
