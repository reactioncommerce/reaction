/**
 * @summary return a single coupon log based on shopId and _id
 * @param {Object} context - the application context
 * @param {String} shopId - The id of the shop
 * @param {String} _id - The unencoded id of the coupon log
 * @return {Object} - The coupon log or null
 */
export default async function couponLog(context, { shopId, _id }) {
  const { collections: { CouponLogs } } = context;
  const singleCouponLog = await CouponLogs.findOne({ shopId, _id });
  return singleCouponLog;
}
