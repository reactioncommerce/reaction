/**
 * @method archiveCoupon
 * @summary Archive a coupon mutation
 * @param {Object} _ unused
 * @param {Object} args.input - The input arguments
 * @param {Object} args.input.shopId - The shopId
 * @param {Object} args.input.promotionId - The promotion ID
 * @param {Object} context - The application context
 * @returns {Promise<Object>} with archived coupon result
 */
export default async function archiveCoupon(_, { input }, context) {
  const { shopId } = input;

  await context.validatePermissions("reaction:legacy:promotions", "update", { shopId });

  const archivedCouponResult = await context.mutations.archiveCoupon(context, input);
  return archivedCouponResult;
}
