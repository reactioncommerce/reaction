import applyOffersToCart from "../methods/applyOfersToCart.js";

/**
 * @summary handle after cart creation
 * @param {object} context - The per-request application context
 * @param {Object} cart - The cart to deal with
 * @param {Object} updatedBy - The user who created the cart
 * @returns {undefined} undefined
 */
export default async function handleAfterCartCreate(context, { cart, _, emittedBy }) {
  if (emittedBy !== "promotions") {
    await applyOffersToCart(context, cart);
  }
}
