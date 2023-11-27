/**
 * @summary apply explicit promotion to a cart
 * @param {Object} context - The application context
 * @param {Object} cart - The cart to apply promotions to
 * @param {Object} promotion - The promotion to apply
 * @returns {Promise<Object>} - The cart with promotions applied and applied promotions
 */
export default async function applyExplicitPromotion(context, cart, promotion) {
  if (!Array.isArray(cart.appliedPromotions)) {
    cart.appliedPromotions = [];
  }
  cart.appliedPromotions.push({
    ...promotion,
    newlyAdded: true
  });
  cart.promotionsVersion = 2;
  const updatedCart = await context.mutations.saveCart(context, cart);
  return updatedCart;
}
