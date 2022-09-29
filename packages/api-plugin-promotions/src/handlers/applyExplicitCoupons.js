import { createRequire } from "module";
import Logger from "@reactioncommerce/logger";
import _ from "lodash";
import enhanceCart from "../utils/enhanceCart.js";
import canBeApplied from "../utils/canBeApplied.js";

const require = createRequire(import.meta.url);
const pkg = require("../../package.json");

const { name, version } = pkg;
const logCtx = {
  name,
  version,
  file: "applyExplicitCoupons.js"
};

/**
 * @summary check if promotion is expired
 * @param {Object} promotion - The promotion to check
 * @returns {Boolean} - Whether the promotion is expired
 */
function isPromotionExpired(promotion) {
  const { endDate } = promotion;
  const now = new Date();
  if (endDate && endDate < now) {
    Logger.info({ ...logCtx, promotionId: promotion._id }, "Promotion is expired");
    return true;
  }
  return false;
}

/**
 * @summary check if promotion already exists on the cart
 * @param {Array<Object>} appliedPromotions - The cart's applied promotions
 * @param {Object} promotion - The promotion to check
 * @returns {Boolean} - Whether the promotion already exists on the cart
 */
function isPromotionExists(appliedPromotions, promotion) {
  if (_.find(appliedPromotions, { _id: promotion._id })) {
    Logger.info({ ...logCtx, promotionId: promotion._id }, "Promotion already applied on the cart");
    return true;
  }
  return false;
}

/**
 * @summary remove promotion message when promotion is applied
 * @param {Array<Object>} promotionMessages - The cart's promotion messages
 * @param {Array<Object>} appliedPromotions - The cart's applied promotions
 * @returns {Array<Object>} - The cart's promotion messages
 */
function removeMessageWhenPromotionApplied(promotionMessages, appliedPromotions) {
  const appliedPromotionIds = appliedPromotions.map((appliedPromotion) => appliedPromotion._id);
  return promotionMessages.filter((promotionMessage) => !appliedPromotionIds.includes(promotionMessage.promotion._id));
}

/**
 * @summary apply promotions to a cart
 * @param {Object} context - The application context
 * @param {Object} cart - The cart to apply promotions to
 * @param {Object} promotions - The cart to apply promotions to
 * @returns {Object} - The cart with promotions applied
 */
export default async function applyExplicitCoupons(context, cart, promotions) {
  const { promotions: pluginPromotions } = context;

  const enhancedCart = enhanceCart(context, pluginPromotions.enhancers, cart);
  const triggerHandleByKey = _.keyBy(pluginPromotions.triggers, "key");
  const actionHandleByKey = _.keyBy(pluginPromotions.actions, "key");

  const appliedPromotions = Array.isArray(cart.appliedPromotions) ? cart.appliedPromotions : [];
  const promotionMessages = Array.isArray(cart.promotionMessages) ? cart.promotionMessages : [];
  for (const promotion of promotions) {
    if (isPromotionExists(appliedPromotions, promotion)) {
      continue;
    }

    if (isPromotionExpired(promotion)) {
      promotionMessages.push({ promotion, rejectionReason: "expired" });
      continue;
    }

    if (!canBeApplied(cart.appliedPromotions, promotion)) {
      promotionMessages.push({ promotion, rejectionReason: "cannot-be-combined" });
      continue;
    }

    const couponTrigger = promotion.triggers.find((trigger) => trigger.triggerKey === "coupons");
    const { actions } = promotion;

    const { triggerKey, triggerParameters } = couponTrigger;
    const triggerFn = triggerHandleByKey[triggerKey];
    if (!triggerFn) continue;

    // eslint-disable-next-line no-await-in-loop
    const shouldApply = await triggerFn.handler(context, enhancedCart, { promotion, triggerParameters });
    if (!shouldApply) {
      promotionMessages.push({ promotion, rejectionReason: "cannot-be-combined" });
      continue;
    }

    for (const action of actions) {
      const { actionKey, actionParameters } = action;
      const actionFn = actionHandleByKey[actionKey];
      if (actionFn) {
        // eslint-disable-next-line no-await-in-loop
        await actionFn.handler(context, enhancedCart, { promotion, actionParameters });
      }
    }
    appliedPromotions.push(promotion);
    break;
  }
  cart.appliedPromotions = appliedPromotions;
  cart.promotionMessages = removeMessageWhenPromotionApplied(promotionMessages, appliedPromotions);

  Logger.info(
    { ...logCtx, cartId: cart._id, promotionsCount: appliedPromotions.length, promotionMessagesCount: promotionMessages.length },
    "Applied coupons to cart"
  );
  context.mutations.saveCart(context, cart, "promotions");
}
