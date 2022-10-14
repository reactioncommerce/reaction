import { decodeCartOpaqueId } from "../../xforms/id.js";

/**
 * @method applyCouponToCart
 * @summary Apply a coupon to the cart
 * @param {Object} _ unused
 * @param {Object} args.input - The input arguments
 * @param {Object} args.input.cartId - The cart ID
 * @param {Object} args.input.couponCode - The promotion IDs
 * @param {Object} context - The application context
 * @returns {Promise<Object>} with updated cart
 */
export default async function applyCouponToCart(_, { input }, context) {
  const { cartId, couponCode } = input;
  const decodedCartId = decodeCartOpaqueId(cartId);

  const appliedCart = await context.mutations.applyCouponToCart(context, { cartId: decodedCartId, couponCode });

  return { cart: appliedCart };
}
