/**
 * @name Refund/amount
 * @method
 * @memberof Order/GraphQL
 * @summary converts the `amount` and `currency` props on the provided refund to a Money object
 * @param {Object} refund - result of the parent resolver, which is a refund object in GraphQL schema format
 * @returns {Object} A Money object
 */
export default function amount(refund) {
  return {
    amount: refund.amount,
    currencyCode: refund.currency
  };
}
