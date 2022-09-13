import Logger from "@reactioncommerce/logger";
import applyDiscountToCart from "../util/applyDiscountToCart.js";

/**
 * @summary handle when a discount action has been triggered
 * @param {Object} context - The application context
 * @param {Object} actionData - The parameters passed to actions
 * @param {Object} params - Any parameters from offer
 * @returns {Promise<void>} undefined
 */
export default async function handlePromotionActionTriggered(context, { actionKey, actionParameters, params }) {
  if (actionKey === "applyDiscountToCart") {
    const { cart } = params;
    Logger.info("applyDiscountToCart action triggered", params);
    await applyDiscountToCart(context, actionParameters, cart);
  }
}
