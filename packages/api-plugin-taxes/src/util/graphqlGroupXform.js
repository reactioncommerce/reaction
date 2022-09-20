import getRateObjectForRate from "@reactioncommerce/api-utils/getRateObjectForRate.js";

export default {
  taxSummary(group) {
    const { taxSummary } = group;
    if (!taxSummary) return null;

    // Currency code can be found in different places depending on whether this is called with a
    // Cart or an OrderFulfillmentGroup
    const currencyCode = group.currencyCode || (group.payment && group.payment.currencyCode);

    return {
      ...taxSummary,
      tax: {
        currencyCode,
        amount: taxSummary.tax
      },
      taxableAmount: {
        currencyCode,
        amount: taxSummary.taxableAmount
      },
      taxes: taxSummary.taxes.map((calculatedTax) => ({
        ...calculatedTax,
        tax: {
          currencyCode,
          amount: calculatedTax.tax
        },
        taxableAmount: {
          currencyCode,
          amount: calculatedTax.taxableAmount
        },
        taxRate: getRateObjectForRate(calculatedTax.taxRate)
      }))
    };
  }
};
