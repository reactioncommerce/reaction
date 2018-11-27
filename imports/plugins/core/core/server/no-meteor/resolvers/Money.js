import { getXformedCurrencyByCode } from "@reactioncommerce/reaction-graphql-xforms/currency";
import { formatMoney } from "/imports/plugins/core/catalog/server/no-meteor/utils/getPriceRange";
import CurrencyDefinitions from "/imports/plugins/core/core/lib/CurrencyDefinitions";

export default {
  currency: (node) => getXformedCurrencyByCode(node.currencyCode),
  displayAmount: (node) => formatMoney(node.amount, CurrencyDefinitions[node.currencyCode])
};
