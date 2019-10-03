import getRateObjectForRate from "@reactioncommerce/api-utils/getRateObjectForRate.js";

export default {
  tax(orderItem) {
    if (!orderItem.tax) return null;

    const { currencyCode } = orderItem.price;

    return {
      currencyCode,
      amount: orderItem.tax
    };
  },
  taxableAmount(orderItem) {
    if (!orderItem.taxableAmount) return null;

    const { currencyCode } = orderItem.price;

    return {
      currencyCode,
      amount: orderItem.taxableAmount
    };
  },
  taxes(orderItem) {
    if (!orderItem.taxes) return [];

    const { currencyCode } = orderItem.price;

    return orderItem.taxes.map((calculatedTax) => ({
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
    }));
  }
};
