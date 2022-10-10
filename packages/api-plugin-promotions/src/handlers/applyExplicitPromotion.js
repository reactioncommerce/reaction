import applyPromotions from "./applyPromotions.js";

/**
 * @summary apply explicit promotion to a cart
 * @param {Object} context - The application context
 * @param {Object} cart - The cart to apply promotions to
 * @param {Object} promotion - The promotion to apply
 * @returns {Object} - The cart with promotions applied and applied promotions
 */
export default async function applyExplicitPromotion(context, cart, promotion) {
  return applyPromotions(context, cart, promotion);
}
