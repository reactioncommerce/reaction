/* eslint-disable no-await-in-loop */
import _ from "lodash";
import canAddToCartMessages from "../utils/canAddCartMessage.js";
import canBeApplied from "../utils/canBeApplied.js";
import createCartMessage from "../utils/createCartMessage.js";
import enhanceCart from "../utils/enhanceCart.js";
import actionHandler from "../utils/actionHandler.js";

/**
 * @summary a handler for the "combination" type of promotion
 * @param {Object} context - an object containing the per-request state
 * @param {Object} cart - the cart to apply the promotion to
 * @param {Array<Object>} params.promotions - the promotion to apply
 * @returns {Promise<Object>} the action result
 */
export default async function applyCombinationPromotions(context, cart, { promotions }) {
  const { promotions: { enhancers }, simpleSchemas: { CartPromotionItem } } = context;

  const appliedPromotions = [];
  let enhancedCart = enhanceCart(context, enhancers, cart);
  for (const promotion of promotions) {
    const { affected } = await actionHandler(context, enhancedCart, promotion);
    if (!affected) {
      if (canAddToCartMessages(enhancedCart, promotion)) {
        enhancedCart.messages.push(createCartMessage({
          title: "The promotion is not affected",
          subject: "promotion",
          severity: "warning",
          metaFields: {
            promotionId: promotion._id
          }
        }));
      }
      continue;
    }

    enhancedCart = enhanceCart(context, enhancers, enhancedCart);

    const { qualifies, reason } = await canBeApplied(context, enhancedCart, { appliedPromotions, promotion });
    if (!qualifies) {
      if (canAddToCartMessages(enhancedCart, promotion)) {
        enhancedCart.messages.push(createCartMessage({
          title: "The promotion cannot be applied",
          subject: "promotion",
          severity: "warning",
          message: reason,
          metaFields: {
            promotionId: promotion._id
          }
        }));
      }
      continue;
    }

    const affectedPromotion = _.cloneDeep(promotion);
    CartPromotionItem.clean(affectedPromotion);
    appliedPromotions.push(affectedPromotion);
  }
  enhancedCart.appliedPromotions = appliedPromotions;
  Object.assign(cart, enhancedCart);
}
