/**
 * @name exampleCreateRefund
 * @method
 * @summary Create a refund for an order for example payment method
 * @param {Object} context an object containing the per-request state
 * @param {Object} payment object containing transaction ID
 * @param {Number} amount the amount to be refunded
 * @return {Object} refund result
 * @private
 */
export default async function exampleCreateRefund(context, payment, amount) {
  const { currencyCode, transactionId } = payment;
  await context.collections.ExampleIOUPaymentRefunds.insertOne({
    amount,
    createdAt: new Date(),
    currencyCode,
    transactionId
  });
  return { saved: true };
}
