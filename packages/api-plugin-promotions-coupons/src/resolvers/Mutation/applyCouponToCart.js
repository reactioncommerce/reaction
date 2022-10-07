import { decodeCartOpaqueId, decodePromotionOpaqueId } from "../../xforms/id.js";

/**
 * @method applyCouponToCart
 * @summary Apply a coupon to the cart
 * @param {Object} _ unused
 * @param {Object} args.input - The input arguments
 * @param {Object} args.input.cartId - The cart ID
 * @param {Object} args.input.promotionIds - The promotion IDs
 * @param {Object} context - The application context
 * @returns {Promise<Object>} with updated cart
 */
export default async function applyCouponToCart(_, { input }, context) {
  const { cartId, promotionIds } = input;
  const decodedCartId = decodeCartOpaqueId(cartId);
  const decodePromotionIds = promotionIds.map((promotionId) => decodePromotionOpaqueId(promotionId));

  const cart = await context.mutations.applyExplicitPromotions(context, { cartId: decodedCartId, promotionIds: decodePromotionIds });

  return { cart };
}
