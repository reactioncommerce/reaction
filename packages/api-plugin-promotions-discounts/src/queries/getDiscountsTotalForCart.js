/**
 * @summary Calculates total discount amount for a cart based on all discounts
 *   that have been applied to it
 * @param {Object} context Context object
 * @param {Object} cart The cart to get discounts from
 * @returns {Object} Object with `discounts` array and `total`
 */
export default async function getDiscountsTotalForCart(context, cart) {
  const discounts = cart.discounts || [];
  const appliedPromotions = cart.appliedPromotions || [];

  for (const cartItem of cart.items) {
    if (cartItem.discounts) {
      discounts.push(...cartItem.discounts.filter((discount) => discount.discountType === "item"));
    }
  }

  for (const shipping of cart.shipping) {
    if (Array.isArray(shipping.discounts)) {
      discounts.push(...shipping.discounts);
    }
  }

  return {
    discounts,
    appliedPromotions,
    total: cart.discount
  };
}
