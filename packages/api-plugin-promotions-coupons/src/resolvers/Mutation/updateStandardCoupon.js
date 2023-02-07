/**
 * @method updateStandardCoupon
 * @summary Update a standard coupon mutation
 * @param {Object} _ unused
 * @param {Object} args.input - The input arguments
 * @param {Object} args.input.shopId - The shop ID
 * @param {Object} args.input.couponId - The coupon ID
 * @param {Object} args.input.promotionId - The promotion ID
 * @param {Object} context - The application context
 * @returns {Promise<Object>} with updated coupon result
 */
export default async function updateStandardCoupon(_, { input }, context) {
  const { shopId } = input;

  await context.validatePermissions("reaction:legacy:promotions", "update", { shopId });

  const updatedCouponResult = await context.mutations.updateStandardCoupon(context, input);
  return updatedCouponResult;
}
