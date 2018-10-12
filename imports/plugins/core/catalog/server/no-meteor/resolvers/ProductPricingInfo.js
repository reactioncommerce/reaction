import { getXformedCurrencyByCode, xformCurrencyExchangePricing } from "@reactioncommerce/reaction-graphql-xforms/currency";

export default {
  currency: (node) => getXformedCurrencyByCode(node.currencyCode),
  currencyExchangePricing: (node, { currencyCode }, context) => xformCurrencyExchangePricing(node, currencyCode, context),
  compareAtPrice: (node) => ({ amount: node.compareAtPrice || 0, currencyCode: node.currencyCode })
};
