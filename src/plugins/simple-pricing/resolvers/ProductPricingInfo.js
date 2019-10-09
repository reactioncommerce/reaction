import getCurrencyDefinitionByCode from "@reactioncommerce/api-utils/getCurrencyDefinitionByCode.js";
import xformCurrencyExchangePricing from "../util/xformCurrencyExchangePricing.js";

export default {
  currency: (node) => getCurrencyDefinitionByCode(node.currencyCode),
  currencyExchangePricing: (node, { currencyCode }, context) => xformCurrencyExchangePricing(node, currencyCode, context),
  compareAtPrice: ({ compareAtPrice: amount, currencyCode }) => (typeof amount === "number" && amount > 0 ? { amount, currencyCode } : null)
};
