/**
 * @summary return a possibly filtered list of coupons
 * @param {Object} context - The application context
 * @param {String} shopId - The shopId to query for
 * @param {Object} filter - optional filter parameters
 * @return {Promise<Array<Coupon>>} - A list of coupons
 */
export default async function coupons(context, shopId, filter) {
  const { collections: { Coupons } } = context;

  const selector = { shopId };

  if (filter) {
    const { expirationDate, promotionId, code, userId, isArchived } = filter;

    if (expirationDate) {
      selector.expirationDate = { $gte: expirationDate };
    }

    if (promotionId) {
      selector.promotionId = promotionId;
    }

    if (code) {
      selector.code = code;
    }

    if (userId) {
      selector.userId = userId;
    }

    if (typeof isArchived === "boolean") {
      selector.isArchived = isArchived;
    }
  }

  return Coupons.find(selector);
}
