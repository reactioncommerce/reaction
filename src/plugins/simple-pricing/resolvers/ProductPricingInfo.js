import getCurrencyDefinitionByCode from "@reactioncommerce/api-utils/getCurrencyDefinitionByCode.js";

export default {
  currency: (node) => getCurrencyDefinitionByCode(node.currencyCode),
  compareAtPrice: ({ compareAtPrice: amount, currencyCode }) => (typeof amount === "number" && amount > 0 ? { amount, currencyCode } : null)
};
