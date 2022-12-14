/**
 * @summary Add price type to cart items
 * @param {Object} context - The application context
 * @param {Object} cart - The cart
 * @returns {undefined}
 */
export default async function addPriceTypeToCartItems(context, cart) {
  for (const cartItem of cart.items) {
    // eslint-disable-next-line no-await-in-loop
    const { variant } = await context.queries.findProductAndVariant(
      context,
      cartItem.productId,
      cartItem.variantId
    );
    cartItem.priceType = variant.priceType || "full";
  }
}
