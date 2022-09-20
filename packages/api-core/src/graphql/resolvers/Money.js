import getCurrencyDefinitionByCode from "@reactioncommerce/api-utils/getCurrencyDefinitionByCode.js";
import formatMoney from "@reactioncommerce/api-utils/formatMoney.js";

export default {
  currency: (node) => getCurrencyDefinitionByCode(node.currencyCode),
  displayAmount: (node) => formatMoney(node.amount, node.currencyCode)
};
