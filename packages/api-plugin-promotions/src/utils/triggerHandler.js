import _ from "lodash";

/**
 * @summary a handler for the "trigger" type of promotion
 * @param {Object} context - an object containing the per-request state
 * @param {Object} enhancedCart - the cart to apply the promotion to
 * @param {Object} promotion - the promotion to apply
 * @returns {Promise<Boolean>} true if the promotion passes the triggers
 */
export default async function triggerHandler(context, enhancedCart, promotion) {
  const { promotions: pluginPromotions } = context;
  const triggerHandleByKey = _.keyBy(pluginPromotions.triggers, "key");

  for (const trigger of promotion.triggers) {
    const { triggerKey, triggerParameters } = trigger;
    const triggerFn = triggerHandleByKey[triggerKey];
    if (!triggerFn) continue;

    // eslint-disable-next-line no-await-in-loop
    const shouldApply = await triggerFn.handler(context, enhancedCart, { promotion, triggerParameters });
    if (shouldApply) return true;
  }
  return false;
}
