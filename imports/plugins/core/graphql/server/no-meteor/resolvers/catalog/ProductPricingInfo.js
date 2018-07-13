import { getXformedCurrencyByCode } from "@reactioncommerce/reaction-graphql-xforms/currency";

export default {
  currency: (info, _, context) => getXformedCurrencyByCode(context, context.shopId, info.currencyCode)
};
