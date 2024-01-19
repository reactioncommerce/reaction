import applyExplicitPromotion from "../handlers/applyExplicitPromotion.js";

/**
 * @method applyExplicitPromotion
 * @summary Apply a coupon code to a cart
 * @param {Object} context - The application context
 * @param {Object} cart - The cart to apply the promotion to
 * @param {Object} promotion - The promotion to apply
 * @returns {Promise<Object>} with cart
 */
export default async function applyExplicitPromotionToCart(context, cart, promotion) {
  return applyExplicitPromotion(context, cart, promotion);
}
