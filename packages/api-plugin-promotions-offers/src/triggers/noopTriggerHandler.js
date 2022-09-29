import Logger from "@reactioncommerce/logger";

/**
 * @summary a no-op function for testing of promotions
 * @param {Object} context - The application context
 * @param {Object} enhancedCart - The cart to apply promotions to
 * @param {Object} trigger - The parameters to pass to the trigger
 * @returns {Boolean} - Whether the promotion can be applied to the cart
 */
export default async function noopTriggerHandler(context, enhancedCart, promotion) {
  Logger.info("No-op handler triggered");
  return false;
}
