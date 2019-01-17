import { getXformedCurrencyByCode } from "@reactioncommerce/reaction-graphql-xforms/currency";
import formatMoney from "/imports/utils/formatMoney";

export default {
  currency: (node) => getXformedCurrencyByCode(node.currencyCode),
  displayAmount: (node) => formatMoney(node.amount, node.currencyCode)
};
