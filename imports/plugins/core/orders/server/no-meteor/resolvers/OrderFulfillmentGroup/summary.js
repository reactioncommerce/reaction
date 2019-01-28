import { xformRateToRateObject } from "@reactioncommerce/reaction-graphql-xforms/core";

/**
 * @name "OrderFulfillmentGroup.summary"
 * @method
 * @memberof Order/GraphQL
 * @summary converts the `invoice` prop on the provided order fulfillment group to a summary object
 * @param {Object} fulfillmentGroup - result of the parent resolver, which is an OrderFulfillmentGroup object in GraphQL schema format
 * @return {Object} A connection object
 */
export default function summary(fulfillmentGroup) {
  const { invoice } = fulfillmentGroup;
  const { currencyCode, discounts, effectiveTaxRate, shipping, subtotal, taxableAmount, taxes, total } = invoice;

  return {
    discountTotal: { amount: discounts, currencyCode },
    effectiveTaxRate: xformRateToRateObject(effectiveTaxRate),
    fulfillmentTotal: { amount: shipping, currencyCode },
    itemTotal: { amount: subtotal, currencyCode },
    taxableAmount: { amount: taxableAmount, currencyCode },
    taxTotal: { amount: taxes, currencyCode },
    total: { amount: total, currencyCode }
  };
}
