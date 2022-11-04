import Logger from "@reactioncommerce/logger";

/**
 * @summary a no-op function for testing of promotions
 * @param {Object} context - The application context
 * @param {Object} enhancedCart - The cart to apply promotions to
 * @param {Object} actionParameters - The parameters to pass to the action
 * @return {void}
 */
export function noop(context, enhancedCart, { actionParameters }) {
  Logger.info(actionParameters, "No-op action triggered");
}

export default {
  key: "noop",
  handler: noop,
  cleanup: () => {}
};
