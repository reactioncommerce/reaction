import { get } from "lodash";
import { encodeAccountOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/account";
import { getXformedCurrencyByCode } from "@reactioncommerce/reaction-graphql-xforms/currency";
import { resolveShopFromShopId } from "@reactioncommerce/reaction-graphql-utils";
import addressBook from "./addressBook";

export default {
  _id: (account) => encodeAccountOpaqueId(account._id),
  addressBook,
  currency: (account) => getXformedCurrencyByCode(account.profile && account.profile.currency),
  emailRecords: (account) => account.emails,
  preferences: (account) => get(account, "profile.preferences"),
  primaryEmailAddress: (account) => {
    const primaryRecord = (account.emails || []).find((record) => record.provides === "default");
    return (primaryRecord && primaryRecord.address) || null;
  },
  shop: resolveShopFromShopId
};
