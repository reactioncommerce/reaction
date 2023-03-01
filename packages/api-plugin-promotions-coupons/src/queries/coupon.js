/**
 * @summary return a single coupon based on shopId and _id
 * @param {Object} context - the application context
 * @param {String} shopId - The id of the shop
 * @param {String} _id - The unencoded id of the coupon
 * @return {Object} - The coupon or null
 */
export default async function coupon(context, { shopId, _id }) {
  const { collections: { Coupons } } = context;
  const singleCoupon = await Coupons.findOne({ shopId, _id });
  return singleCoupon;
}
