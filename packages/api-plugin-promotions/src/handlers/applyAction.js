/**
 * @method applyAction
 * @summary apply promotions to a cart
 * @param {Object} context - The application context
 * @param {Object} enhancedCart - The cart to apply promotions to
 * @param {Object} params.promotion - The promotion to apply
 * @param {Object} params.actionParameters - The parameters for the action
 * @returns {void}
 */
export default async function applyAction(context, enhancedCart, { promotion, actionHandleByKey }) {
  for (const action of promotion.actions) {
    const { actionKey, actionParameters } = action;
    const actionFn = actionHandleByKey[actionKey];
    if (!actionFn) continue;

    // eslint-disable-next-line no-await-in-loop
    await actionFn.handler(context, enhancedCart, { promotion, actionParameters });
  }
}
