/**
 * @summary check if promotion is expired
 * @param {Date} currentTime - The current time
 * @param {Object} promotion - The promotion to check
 * @returns {Boolean} - Whether the promotion is expired
 */
export default function isPromotionExpired(currentTime, promotion) {
  const { endDate } = promotion;
  return endDate && endDate < currentTime;
}
