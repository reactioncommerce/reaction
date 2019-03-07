/**
 * @summary Stripe uses a "Decimal-less" format so 10.00 becomes 1000
 * @param {Number} amount Non-Stripe amount
 * @returns {Number} Stripe amount
 */
export default function formatForStripe(amount) {
  return Math.round(amount * 100);
}
