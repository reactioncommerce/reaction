/**
 * @name exampleListRefunds
 * @method
 * @summary List refunds
 * @param {Object} context an object containing the per-request state
 * @param {Object} payment object containing transaction ID
 * @return {Object} refund result
 * @private
 */
export default async function exampleListRefunds(context, payment) {
  const { transactionId } = payment;

  const refunds = await context.collections.ExampleIOUPaymentRefunds.find({ transactionId }).toArray();

  return refunds.map((refund) => ({
    amount: refund.amount,
    created: refund.createdAt.getTime(),
    currency: refund.currencyCode,
    raw: {},
    type: "refund"
  }));
}
