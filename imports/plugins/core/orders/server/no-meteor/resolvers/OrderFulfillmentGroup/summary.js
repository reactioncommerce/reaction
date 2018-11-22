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
  const { invoice, payment } = fulfillmentGroup;
  const { discounts, effectiveTaxRate, shipping, subtotal, surcharges, taxableAmount, taxes, total } = invoice;

  return {
    discountTotal: {
      amount: discounts,
      currencyCode: payment.currencyCode
    },
    effectiveTaxRate: xformRateToRateObject(effectiveTaxRate),
    fulfillmentTotal: {
      amount: shipping,
      currencyCode: payment.currencyCode
    },
    itemTotal: {
      amount: subtotal,
      currencyCode: payment.currencyCode
    },
    surchargeTotal: {
      amount: surcharges,
      currencyCode: payment.currencyCode
    },
    taxableAmount: {
      amount: taxableAmount,
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
