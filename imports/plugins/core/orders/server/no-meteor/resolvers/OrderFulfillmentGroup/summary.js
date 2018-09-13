/**
 * @name "OrderFulfillmentGroup.summary"
 * @method
 * @memberof Order/GraphQL
 * @summary converts the `invoice` prop on the provided order fulfillment group to a summary object
 * @param {Object} fulfillmentGroup - result of the parent resolver, which is an OrderFulfillmentGroup object in GraphQL schema format
 * @return {Object} A connection object
 */
export default function summary(fulfillmentGroup) {
  const { invoice, payment } = fulfillmentGroup;
  const { discounts, shipping, subtotal, taxes, total } = invoice;

  return {
    discountTotal: {
      amount: discounts,
      currencyCode: payment.currencyCode
    },
    fulfillmentTotal: {
      amount: shipping,
      currencyCode: payment.currencyCode
    },
    itemTotal: {
      amount: subtotal,
      currencyCode: payment.currencyCode
    },
    taxTotal: {
      amount: taxes,
      currencyCode: payment.currencyCode
    },
    total: {
      amount: total,
      currencyCode: payment.currencyCode
    }
  };
}
