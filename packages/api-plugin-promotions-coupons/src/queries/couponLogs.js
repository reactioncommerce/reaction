/**
 * @summary return a possibly filtered list of coupon logs
 * @param {Object} context - The application context
 * @param {String} shopId - The shopId to query for
 * @param {Object} filter - optional filter parameters
 * @return {Promise<Array<CouponLogs>>} - A list of coupon logs
 */
export default async function couponLogs(context, shopId, filter) {
  const { collections: { CouponLogs } } = context;

  const selector = { shopId };

  if (filter) {
    const { couponId, promotionId, orderId, accountId } = filter;

    if (couponId) {
      selector.couponId = couponId;
    }

    if (promotionId) {
      selector.promotionId = promotionId;
    }

    if (orderId) {
      selector.orderId = orderId;
    }

    if (accountId) {
      selector.accountId = accountId;
    }
  }

  return CouponLogs.find(selector);
}
