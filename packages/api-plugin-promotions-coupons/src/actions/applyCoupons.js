import Logger from "@reactioncommerce/logger";

/**
 * @method applyCoupons
 * @summary apply promotions to a cart
 * @param {Object} context - The application context
 * @param {Object} enhancedCart - The cart to apply promotions to
 * @param {Object} actionParameters - The parameters to pass to the action
 * @return {void}
 */
export default function applyCoupons(context, enhancedCart, { promotion, actionParameters }) {
  Logger.info(actionParameters, "Apply coupons action triggered");
}
