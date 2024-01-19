import _ from "lodash";

/**
 * @summary a handler for the "action" type of promotion
 * @param {Object} context - an object containing the per-request state
 * @param {Object} enhancedCart - the cart to apply the promotion to
 * @param {Object} promotion - the promotion to apply
 * @returns {Promise<Object>} the action result
 */
export default async function actionHandler(context, enhancedCart, promotion) {
  const { promotions: pluginPromotions } = context;
  const actionHandleByKey = _.keyBy(pluginPromotions.actions, "key");

  let affected = false;
  let temporaryAffected = false;
  let rejectedReason;
  for (const action of promotion.actions) {
    const actionFn = actionHandleByKey[action.actionKey];
    if (!actionFn) continue;

    // eslint-disable-next-line no-await-in-loop
    const result = await actionFn.handler(context, enhancedCart, { promotion, ...action });
    ({ affected, temporaryAffected, reason: rejectedReason } = result);
  }

  return { affected, temporaryAffected, rejectedReason };
}
