import { getXformedCurrencyByCode } from "@reactioncommerce/reaction-graphql-xforms/currency";
import xformCurrencyExchangePricing from "../util/xformCurrencyExchangePricing";

export default {
  currency: (node) => getXformedCurrencyByCode(node.currencyCode),
  currencyExchangePricing: (node, { currencyCode }, context) => xformCurrencyExchangePricing(node, currencyCode, context),
  compareAtPrice: ({ compareAtPrice: amount, currencyCode }) => (typeof amount === "number" && amount > 0 ? { amount, currencyCode } : null)
};
