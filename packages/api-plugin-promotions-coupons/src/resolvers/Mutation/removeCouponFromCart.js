/**
 * @method removeCouponFromCart
 * @summary Apply a coupon to the cart
 * @param {Object} _ unused
 * @param {Object} args.input - The input arguments
 * @param {Object} args.input.cartId - The cart ID
 * @param {Object} args.input.couponCode - The promotion IDs
 * @param {Object} context - The application context
 * @returns {Promise<Object>} with updated cart
 */
export default async function removeCouponFromCart(_, { input }, context) {
  const updatedCart = await context.mutations.removeCouponFromCart(context, input);
  return { cart: updatedCart };
}
