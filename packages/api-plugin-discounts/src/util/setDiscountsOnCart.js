import getDiscountsTotalForCart from "../queries/getDiscountsTotalForCart.js";

/**
 * @summary Cart transformation function that sets `discount` on cart
 * @param {Object} context Startup context
 * @param {Object} cart The cart, which can be mutated.
 * @returns {undefined}
 */
export default async function setDiscountsOnCart(context, cart) {
  // check if promotion discounts are enabled
  if (!context.discountCalculationMethods) {
    const { total } = await getDiscountsTotalForCart(context, cart);
    cart.discount = total;
  }
}
