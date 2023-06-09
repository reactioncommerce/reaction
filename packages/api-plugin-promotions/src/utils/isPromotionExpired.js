/**
 * @summary check if promotion is expired
 * @param {Object} promotion - The promotion to check
 * @returns {Boolean} - Whether the promotion is expired
 */
export default function isPromotionExpired(promotion) {
  const { endDate } = promotion;
  const now = Date.now();
  return endDate && endDate < now;
}
