import applyOffersToCart from "../methods/applyOfersToCart.js";

/**
 * @summary handle after cart updates
 * @param {object} context - The per-request application context
 * @param {Object} args - Args passed in by eventEmitter
 * @returns {undefined} undefined
 */
export default async function handleAfterCartUpdate(context, args) {
  const { cart, emittedBy } = args;
  if (emittedBy !== "promotions") {
    await applyOffersToCart(context, cart);
  }
}
