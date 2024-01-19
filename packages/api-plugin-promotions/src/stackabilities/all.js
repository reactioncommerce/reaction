/* eslint-disable no-unused-vars */
/**
 * @summary check if a promotion can be applied to a cart
 * @param {Object} context - The application context
 * @param {Object} cart - The cart we are trying to apply the promotion to
 * @param {Object} params.promotion - The promotions we are trying to apply
 * @param {Object} params.appliedPromotion - The applied promotion
 * @return {boolean} - Whether the promotion can be applied to the cart
 */
async function all(context, cart, { promotion, appliedPromotion }) {
  return true;
}

export default {
  key: "all",
  handler: all,
  paramSchema: undefined
};
