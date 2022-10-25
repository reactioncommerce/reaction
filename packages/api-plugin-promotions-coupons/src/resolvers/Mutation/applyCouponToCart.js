import { decodeCartOpaqueId, decodeShopOpaqueId } from "../../xforms/id.js";

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
  const { shopId, cartId, couponCode, token } = input;
  const decodedCartId = decodeCartOpaqueId(cartId);
  const decodedShopId = decodeShopOpaqueId(shopId);

  const appliedCart = await context.mutations.applyCouponToCart(context, {
    shopId: decodedShopId,
    cartId: decodedCartId,
    cartToken: token,
    couponCode
  });

  return { cart: appliedCart };
}
