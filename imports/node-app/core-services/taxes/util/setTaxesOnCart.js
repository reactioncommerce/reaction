import getUpdatedCartItems from "./getUpdatedCartItems.js";

/**
 * @summary Cart transformation function that sets tax-related props on cart
 * @param {Object} context Startup context
 * @param {Object} cart The cart, which can be mutated.
 * @param {Object} options Options
 * @param {Function} options.getCommonOrders Call this to get CommonOrder objects for all the cart groups
 * @returns {undefined}
 */
export default async function setTaxesOnCart(context, cart, { getCommonOrders }) {
  const commonOrders = await getCommonOrders();
  const { cartItems, taxSummary } = await getUpdatedCartItems(context, cart, commonOrders);

  cart.items = cartItems;
  cart.taxSummary = taxSummary;
}
