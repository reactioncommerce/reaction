/**
 * @summary Calculates total discount amount for a cart based on all discounts
 *   that have been applied to it
 * @param {Object} context Context object
 * @param {Object} cart The cart to get discounts from
 * @returns {Object} Object with `discounts` array and `total`
 */
export default async function getDiscountsTotalForCart(context, cart) {
  const discounts = cart.discounts || [];

  for (const cartItem of cart.items) {
    if (cartItem.discounts) {
      discounts.push(...cartItem.discounts.filter((discount) => discount.discountType === "item"));
    }
  }

  // TODO: add discounts from shipping

  return {
    discounts,
    total: cart.discount
  };
}
