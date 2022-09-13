import Logger from "@reactioncommerce/logger";

/**
 * @summary a no-op function for testing of promotions
 * @param {Object} context - The application context
 * @param {Object} cart - The cart to apply promotions to
 * @param {Object} actionParameters - The parameters to pass to the action
 * @return {void}
 */
export default function noop(context, cart, actionParameters) {
  Logger.info(actionParameters, "No-op action triggered");
}
