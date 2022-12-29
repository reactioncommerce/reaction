/**
 * @method createStandardCoupon
 * @summary Create a standard coupon mutation
 * @param {Object} _ unused
 * @param {Object} args.input - The input arguments
 * @param {Object} args.input.shopId - The shopId
 * @param {Object} args.input.promotionId - The promotion ID
 * @param {Object} context - The application context
 * @returns {Promise<Object>} with created coupon result
 */
export default async function createStandardCoupon(_, { input }, context) {
  const { shopId } = input;

  await context.validatePermissions("reaction:legacy:promotions", "create", { shopId });

  const createCouponResult = await context.mutations.createStandardCoupon(context, input);
  return createCouponResult;
}
