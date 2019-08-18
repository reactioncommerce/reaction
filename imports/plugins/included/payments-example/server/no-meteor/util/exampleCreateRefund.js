/**
 * @name exampleCreateRefund
 * @method
 * @summary Create a refund for an order for example payment method
 * @param {Object} context an object containing the per-request state
 * @param {Object} payment object containing transaction ID
 * @param {Number} amount the amount to be refunded
 * @param {String} [reason] the reason for the refund
 * @returns {Object} refund result
 * @private
 */
export default async function exampleCreateRefund(context, payment, amount, reason) {
  const { currencyCode, transactionId } = payment;
  await context.collections.ExampleIOUPaymentRefunds.insertOne({
    amount,
    createdAt: new Date(),
    currencyCode,
    reason,
    transactionId
  });
  return { saved: true };
}
