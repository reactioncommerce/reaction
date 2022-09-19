import Logger from "@reactioncommerce/logger";

/**
 * @summary a no-op function for testing of promotions
 * @param {Object} context - The application context
 * @param {Object} actionParameters - The parameters to pass to the action
 * @param {Object} params - The parameters to pass to the action
 * @return {undefined} undefined
 */
export default function noop(context, actionParameters, params) {
  Logger.info({ ...actionParameters, ...params }, "No-op action triggered");
}
