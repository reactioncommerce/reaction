/**
 * @summary Stripe uses a "Decimal-less" format so 10.00 becomes 1000
 * @param {Number} amount Stripe amount
 * @returns {Number} Non-Stripe amount
 */
export default function unformatFromStripe(amount) {
  return (amount / 100);
}
