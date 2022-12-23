/* eslint-disable no-await-in-loop */
import { createRequire } from "module";
import Logger from "@reactioncommerce/logger";
import Random from "@reactioncommerce/random";
import ReactionError from "@reactioncommerce/reaction-error";
import _ from "lodash";
import canBeApplied from "../utils/canBeApplied.js";
import enhanceCart from "../utils/enhanceCart.js";
import isPromotionExpired from "../utils/isPromotionExpired.js";

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
 * @param {String} shopId - The shop ID
 * @returns {Promise<Array<Object>>} - An array of promotions
 */
async function getImplicitPromotions(context, shopId) {
  const now = new Date();
  const { collections: { Promotions } } = context;
  const promotions = await Promotions.find({
    shopId,
    enabled: true,
    triggerType: "implicit",
    startDate: { $lt: now }
  }).toArray();
  Logger.info({ ...logCtx, applicablePromotions: promotions.length }, "Fetched applicable promotions");
  return promotions;
}

/**
 * @summary get all explicit promotions by Ids
 * @param {Object} context - The application context
 * @param {String} shopId - The shop ID
 * @param {Array<string>} promotionIds - The promotion IDs
 * @returns {Promise<Array<Object>>} - An array of promotions
 */
async function getExplicitPromotionsByIds(context, shopId, promotionIds) {
  const now = new Date();
  const { collections: { Promotions } } = context;
  const promotions = await Promotions.find({
    _id: { $in: promotionIds },
    shopId,
    enabled: true,
    triggerType: "explicit",
    startDate: { $lt: now }
  }).toArray();
  return promotions;
}

/**
 * @summary create the cart message
 * @param {String} params.title - The message title
 * @param {String} params.message - The message body
 * @param {String} params.severity - The message severity
 * @returns {Object} - The cart message
 */
export function createCartMessage({ title, message, severity = "info", ...params }) {
  return {
    _id: Random.id(),
    title,
    message,
    severity,
    acknowledged: false,
    requiresReadAcknowledgement: true,
    ...params
  };
}

/**
 * @summary apply promotions to a cart
 * @param {Object} context - The application context
 * @param {Object} cart - The cart to apply promotions to
 * @returns {Promise<Object>} - mutated cart
 */
export default async function applyPromotions(context, cart) {
  const promotions = await getImplicitPromotions(context, cart.shopId);
  const { promotions: pluginPromotions, simpleSchemas: { Cart } } = context;

  const triggerHandleByKey = _.keyBy(pluginPromotions.triggers, "key");
  const actionHandleByKey = _.keyBy(pluginPromotions.actions, "key");

  const appliedPromotions = [];
  const appliedExplicitPromotionsIds = _.map(_.filter(cart.appliedPromotions || [], ["triggerType", "explicit"]), "_id");
  const explicitPromotions = await getExplicitPromotionsByIds(context, cart.shopId, appliedExplicitPromotionsIds);

  const cartMessages = cart.messages || [];

  const unqualifiedPromotions = promotions.concat(_.map(explicitPromotions, (promotion) => {
    const existsPromotion = _.find(cart.appliedPromotions || [], { _id: promotion._id });
    if (existsPromotion) promotion.relatedCoupon = existsPromotion.relatedCoupon || undefined;
    if (typeof existsPromotion?.newlyAdded !== "undefined") promotion.newlyAdded = existsPromotion.newlyAdded;
    return promotion;
  }));

  const newlyAddedPromotionId = _.find(unqualifiedPromotions, "newlyAdded")?._id;

  for (const { cleanup } of pluginPromotions.actions) {
    cleanup && await cleanup(context, cart);
  }

  const canAddToCartMessages = (promotion) => {
    if (_.find(cartMessages, { metaFields: { promotionId: promotion._id } })) return false;
    if (promotion.triggerType === "explicit") return true;
    return _.find(cart.appliedPromotions || [], { _id: promotion._id }) !== undefined;
  };

  let enhancedCart = enhanceCart(context, pluginPromotions.enhancers, cart);
  for (const promotion of unqualifiedPromotions) {
    if (isPromotionExpired(promotion)) {
      Logger.info({ ...logCtx, promotionId: promotion._id }, "Promotion is expired, skipping");
      if (canAddToCartMessages(promotion)) {
        cartMessages.push(createCartMessage({
          title: "The promotion has expired",
          subject: "promotion",
          severity: "warning",
          metaFields: {
            promotionId: promotion._id
          }
        }));
      }
      continue;
    }

    const { qualifies, reason } = await canBeApplied(context, cart, { appliedPromotions, promotion });
    if (!qualifies) {
      if (canAddToCartMessages(promotion)) {
        cartMessages.push(createCartMessage({
          title: "The promotion cannot be applied",
          subject: "promotion",
          message: reason,
          severity: "warning",
          metaFields: {
            promotionId: promotion._id
          }
        }));
      }
      continue;
    }

    for (const trigger of promotion.triggers) {
      const { triggerKey, triggerParameters } = trigger;
      const triggerFn = triggerHandleByKey[triggerKey];
      if (!triggerFn) continue;

      const shouldApply = await triggerFn.handler(context, enhancedCart, { promotion, triggerParameters });
      if (!shouldApply) {
        Logger.info({ ...logCtx, promotionId: promotion._id }, "The promotion is not eligible, skipping");
        if (canAddToCartMessages(promotion)) {
          cartMessages.push(createCartMessage({
            title: "The promotion is not eligible",
            subject: "promotion",
            severity: "warning",
            metaFields: {
              promotionId: promotion._id
            }
          }));
        }
        continue;
      }

      let affected = false;
      let rejectedReason;
      for (const action of promotion.actions) {
        const actionFn = actionHandleByKey[action.actionKey];
        if (!actionFn) continue;

        const result = await actionFn.handler(context, enhancedCart, { promotion, ...action });
        ({ affected, reason: rejectedReason } = result);
        enhancedCart = enhanceCart(context, pluginPromotions.enhancers, enhancedCart);
      }

      if (affected) {
        appliedPromotions.push(promotion);
        continue;
      }

      if (canAddToCartMessages(promotion)) {
        cartMessages.push(createCartMessage({
          title: "The promotion was not affected",
          subject: "promotion",
          message: rejectedReason,
          severity: "warning",
          metaFields: {
            promotionId: promotion._id
          }
        }));
      }
      break;
    }
  }

  // If a explicit promotion was just applied, throw an error so that the client can display the message
  if (newlyAddedPromotionId) {
    const message = _.find(cartMessages, ({ metaFields }) => metaFields.promotionId === newlyAddedPromotionId);
    if (message) throw new ReactionError("invalid-params", message.message);
  }

  enhancedCart.appliedPromotions = _.map(appliedPromotions, (promotion) => _.omit(promotion, "newlyAdded"));

  // Remove messages that are no longer relevant
  const cleanedMessages = _.filter(cartMessages, (message) => {
    if (message.subject !== "promotion") return true;
    return _.find(appliedPromotions, { _id: message.metaFields.promotionId, triggerType: "implicit" }) === undefined;
  });

  enhancedCart.messages = cleanedMessages;
  Cart.clean(enhancedCart, { mutate: true });
  Object.assign(cart, enhancedCart);

  Logger.info({ ...logCtx, appliedPromotions: appliedPromotions.length }, "Applied promotions successfully");
  return cart;
}
