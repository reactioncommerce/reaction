import applyOffersToCart from "../methods/applyOfersToCart.js";

/**
 * @summary handle after cart creation
 * @param {object} context - The per-request application context
 * @param {Object} args - The args passed by the event emitter
 * @returns {undefined} undefined
 */
export default async function handleAfterCartCreate(context, args) {
  const { cart, emittedBy } = args;
  if (emittedBy !== "promotions") {
    await applyOffersToCart(context, cart);
  }
}
