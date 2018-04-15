import { get } from "lodash";
import { encodeAccountOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/account";
import { getXformedCurrencyByCode } from "@reactioncommerce/reaction-graphql-xforms/currency";
import addressBook from "./addressBook";
import shop from "./shop";

export default {
  _id: (account) => encodeAccountOpaqueId(account._id),
  addressBook,
  currency: (account, _, context) => getXformedCurrencyByCode(context, account.shopId, account.profile && account.profile.currency),
  emailRecords: (account) => account.emails,
  preferences: (account) => get(account, "profile.preferences"),
  shop
};
