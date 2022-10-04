import { createRequire } from "module";
import Logger from "@reactioncommerce/logger";
import _ from "lodash";

const require = createRequire(import.meta.url);
const pkg = require("../../package.json");

const { name, version } = pkg;
const logCtx = {
  name,
  version,
  file: "applyImplicitPromotions.js"
};

/**
 * @summary get all implicit promotions
 * @param {Object} context - The application context
 * @returns {Array<Object>} - An array of promotions
 */
async function getImplicitPromotions(context) {
  const now = new Date();
  const {
    collections: { Promotions }
  } = context;
  const promotions = await Promotions.find({
    enabled: true,
    type: "implicit",
    startDate: { $lt: now },
    endDate: { $gt: now }
  }).toArray();
  Logger.info({ ...logCtx, applicablePromotions: promotions.length }, "Fetched applicable promotions");
  return promotions;
}

/**
 * @summary enhance the cart with calculated totals
 * @param {Object} context - The application context
 * @param {Array<Function>} enhancers - The enhancers to apply
 * @param {Object} cart - The cart to enhance
 * @returns {Object} - The enhanced cart
 */
function enhanceCart(context, enhancers, cart) {
  const cartForEvaluation = _.cloneDeep(cart);
  enhancers.forEach((enhancer) => {
    enhancer(context, cartForEvaluation);
  });
  return cartForEvaluation;
}

/**
 * @summary check if a promotion can be applied to a cart
 * @param {Array<Object>} appliedPromotions - The promotions already applied to the cart
 * @param {Object} promotion - The promotion to check
 * @returns {Boolean} - Whether the promotion can be applied to the cart
 */
function canBeApplied(appliedPromotions, promotion) {
  if (appliedPromotions.length === 0) {
    return true;
  }
  if (appliedPromotions[0].stackAbility === "none" || promotion.stackAbility === "none") {
    Logger.info(logCtx, "Cart disqualified from promotion because stack ability is none");
    return false;
  }
  return true;
}

/**
 * @summary apply promotions to a cart
 * @param {Object} context - The application context
 * @param {Object} cart - The cart to apply promotions to
 * @returns {Object} - The cart with promotions applied
 */
export default async function applyImplicitPromotions(context, cart) {
  const promotions = await getImplicitPromotions(context);
  const { promotions: pluginPromotions } = context;

  const enhancedCart = enhanceCart(context, pluginPromotions.enhancers, cart);
  const triggerHandleByKey = _.keyBy(pluginPromotions.triggers, "key");
  const actionHandleByKey = _.keyBy(pluginPromotions.actions, "key");

  const appliedPromotions = [];
  for (const promotion of promotions) {
    if (!canBeApplied(appliedPromotions, promotion)) {
      continue;
    }

    const { triggers, actions } = promotion;
    for (const trigger of triggers) {
      const { triggerKey, triggerParameters } = trigger;
      const triggerFn = triggerHandleByKey[triggerKey];
      if (!triggerFn) continue;

      // eslint-disable-next-line no-await-in-loop
      const shouldApply = await triggerFn.handler(context, enhancedCart, { promotion, triggerParameters });
      if (!shouldApply) continue;

      for (const action of actions) {
        const { actionKey, actionParameters } = action;
        const actionFn = actionHandleByKey[actionKey];
        if (!actionFn) continue;

        // eslint-disable-next-line no-await-in-loop
        await actionFn.handler(context, enhancedCart, { promotion, actionParameters });
      }
      appliedPromotions.push(promotion);
      break;
    }
  }

  cart.appliedPromotions = appliedPromotions;
  context.mutations.saveCart(context, cart, "promotions");
}
