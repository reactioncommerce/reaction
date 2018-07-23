import { getXformedCurrencyByCode } from "@reactioncommerce/reaction-graphql-xforms/currency";

export default {
  currency: (node) => getXformedCurrencyByCode(node.currencyCode)
};
