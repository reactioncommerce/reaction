import { getXformedCurrencyByCode, xformCurrencyExchangePricing } from "@reactioncommerce/reaction-graphql-xforms/currency";

export default {
  currency: (node) => getXformedCurrencyByCode(node.currencyCode),
  currencyExchangePricing: (node, { currencyCode }, context) => xformCurrencyExchangePricing(node, currencyCode, context)
};
