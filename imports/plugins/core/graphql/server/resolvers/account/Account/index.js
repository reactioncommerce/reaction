import { getXformedCurrencyByCode } from "@reactioncommerce/reaction-graphql-xforms/currency";
import addressBook from "./addressBook";
import shop from "./shop";

export default {
  addressBook,
  currency: (account, _, context) => getXformedCurrencyByCode(context, account.shopId, account.profile && account.profile.currency),
  shop
};
