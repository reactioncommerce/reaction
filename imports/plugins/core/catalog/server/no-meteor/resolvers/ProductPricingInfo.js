import { getXformedCurrencyByCode, xformCurrencyExchangePricing } from "@reactioncommerce/reaction-graphql-xforms/currency";

export default {
  currency: (node) => getXformedCurrencyByCode(node.currencyCode),
  currencyExchangePricing: (node, { currencyCode }, context) => xformCurrencyExchangePricing(node, currencyCode, context),
  compareAtPrice: ({ compareAtPrice: amount, currencyCode }) => (typeof amount === "number" && amount > 0 ? { amount, currencyCode } : null)
};
