import noop from "../actions/noop.js";

/**
 * @summary test action that does nothing but log
 * @param {Object} context - The application context
 * @param {Object} actionData - The parameters passed to actions
 * @param {Object} params - Any parameters from offer
 * @returns {Promise<void>} undefined
 */
export default async function handlePromotionActionTriggered(context, { actionKey, actionParameters, params }) {
  if (actionKey === "noop") {
    noop(context, actionParameters, params);
  }
}
