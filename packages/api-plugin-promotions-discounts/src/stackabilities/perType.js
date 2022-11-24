/* eslint-disable no-unused-vars */
import _ from "lodash";

/**
 * @summary check if a promotion can be applied to a cart
 * @param {Object} context - The application context
 * @param {Object} cart - The cart we are trying to apply the promotion to
 * @param {Object} params.promotion - The promotions we are trying to apply
 * @param {Object} params.appliedPromotion - The applied promotion
 * @return {boolean} - Whether the promotion can be applied to the cart
 */
async function perType(context, cart, { promotion, appliedPromotion }) {
  const discountAction = _.find(promotion.actions, { actionKey: "discounts" });
  const appliedDiscountAction = _.find(appliedPromotion.actions, { actionKey: "discounts" });
  if (!discountAction || !appliedDiscountAction) return true;

  return discountAction.actionParameters.discountType !== appliedDiscountAction.actionParameters.discountType;
}

export default {
  key: "per-type",
  handler: perType,
  paramSchema: undefined
};
