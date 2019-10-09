import { getXformedCurrencyByCode } from "/src/xforms/currency";
import formatMoney from "../../util/formatMoney.js";

export default {
  currency: (node) => getXformedCurrencyByCode(node.currencyCode),
  displayAmount: (node) => formatMoney(node.amount, node.currencyCode)
};
