/**
 * @summary return a single coupon log based on shopId and _id
 * @param {Object} context - the application context
 * @param {String} params.orderId - The order id of the coupon log
 * @return {Object} - The coupon log or null
 */
export default async function couponLogByOrderId(context, { orderId }) {
  const { collections: { CouponLogs } } = context;
  const singleCouponLog = await CouponLogs.findOne({ orderId });
  return singleCouponLog;
}
