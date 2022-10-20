/**
 * @summary Reset the cart discount state
 * @param {Object} context - The application context
 * @param {Object} cart - The cart to reset
 * @returns {Object} - The cart with the discount state reset
 */
export default function resetCartDiscountState(context, cart) {
  cart.discounts = [];
  cart.discount = 0;
  cart.items = cart.items.map((item) => {
    item.discounts = [];
    item.subtotal = {
      amount: item.price.amount * item.quantity,
      currencyCode: item.subtotal.currencyCode
    };
    return item;
  });

  // todo: add reset logic for the shipping
  // cart.shipping = cart.shipping.map((shipping) => ({ ...shipping, discounts: [] }));

  return cart;
}
