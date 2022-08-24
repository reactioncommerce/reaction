import getRateObjectForRate from "@reactioncommerce/api-utils/getRateObjectForRate.js";

/**
 * @name OrderFulfillmentGroup/summary
 * @method
 * @memberof Order/GraphQL
 * @summary converts the `invoice` prop on the provided order fulfillment group to a summary object
 * @param {Object} fulfillmentGroup - result of the parent resolver, which is an OrderFulfillmentGroup object in GraphQL schema format
 * @returns {Object} A connection object
 */
export default function summary(fulfillmentGroup) {
  const { invoice } = fulfillmentGroup;
  const { currencyCode, discounts, effectiveTaxRate, shipping, subtotal, surcharges, taxableAmount, taxes, total } = invoice;

  return {
    discountTotal: { amount: discounts, currencyCode },
    effectiveTaxRate: getRateObjectForRate(effectiveTaxRate),
    fulfillmentTotal: { amount: shipping, currencyCode },
    itemTotal: { amount: subtotal, currencyCode },
    surchargeTotal: { amount: surcharges, currencyCode },
    taxableAmount: { amount: taxableAmount, currencyCode },
    taxTotal: { amount: taxes, currencyCode },
    total: { amount: total, currencyCode }
  };
}
