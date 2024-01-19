/**
 * @summary Get a coupon for a promotion
 * @param {Object} promotion - The promotion object
 * @param {String} promotion._id - The promotion ID
 * @param {Object} args - unused
 * @param {Object} context - The context object
 * @returns {Promise<Object>} A coupon object
 */
export default async function getPreviewPromotionCoupon(promotion, args, context) {
  const { collections: { Coupons } } = context;
  const coupon = await Coupons.findOne({ promotionId: promotion._id, isArchived: { $ne: true } });
  return coupon;
}
