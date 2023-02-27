/* eslint-disable no-await-in-loop */
import ReactionError from "@reactioncommerce/reaction-error";
import Random from "@reactioncommerce/random";

/**
 * @summary Rollback coupon that has used count changed
 * @param {Object} context - The application context
 * @param {String} couponId - The coupon id
 * @returns {undefined}
 */
async function rollbackCoupon(context, couponId) {
  const { collections: { Coupons } } = context;
  await Coupons.findOneAndUpdate({ _id: couponId }, { $inc: { usedCount: -1 } });
}

/**
 * @summary Update a coupon before order created
 * @param {Object} context - The application context
 * @param {Object} order - The order that was created
 * @returns {undefined}
 */
export default async function updateOrderCoupon(context, order) {
  const { collections: { Coupons, CouponLogs } } = context;

  const appliedPromotions = order.appliedPromotions || [];

  for (const promotion of appliedPromotions) {
    if (!promotion.relatedCoupon) continue;

    const { _id: promotionId, relatedCoupon: { couponId } } = promotion;

    const coupon = await Coupons.findOne({ _id: couponId });
    if (!coupon) continue;

    const { maxUsageTimes, maxUsageTimesPerUser } = coupon;

    const { value: updatedCoupon } = await Coupons.findOneAndUpdate({ _id: couponId }, { $inc: { usedCount: 1 } }, { returnOriginal: false });
    if (updatedCoupon && maxUsageTimes && maxUsageTimes > 0 && updatedCoupon.usedCount > maxUsageTimes) {
      await rollbackCoupon(context, couponId);
      throw new ReactionError("invalid-params", "Coupon no longer available.");
    }

    const couponLog = await CouponLogs.findOne({ couponId, promotionId, accountId: order.accountId });
    if (!couponLog) {
      await CouponLogs.insertOne({
        _id: Random.id(),
        shopId: order.shopId,
        couponId,
        orderId: order._id,
        promotionId: promotion._id,
        accountId: order.accountId,
        usedCount: 1,
        createdAt: new Date()
      });
      continue;
    }

    if (maxUsageTimesPerUser && maxUsageTimesPerUser > 0 && couponLog.usedCount >= maxUsageTimesPerUser) {
      await rollbackCoupon(context, couponId);
      throw new ReactionError("invalid-params", "Your coupon has been used the maximum number of times.");
    }
    await CouponLogs.findOneAndUpdate({ _id: couponLog._id }, { $inc: { usedCount: 1 } });
  }
}
