import _ from "lodash";
import getCurrencyDefinitionByCode from "@reactioncommerce/api-utils/getCurrencyDefinitionByCode.js";
import { encodeAccountOpaqueId } from "../../xforms/id.js";
import addressBook from "./addressBook.js";
import adminUIShops from "./adminUIShops.js";
import groups from "./groups.js";

export default {
  _id: (account) => encodeAccountOpaqueId(account._id),
  addressBook,
  adminUIShops,
  bio: (account) => account.profile.bio,
  currency: (account) => getCurrencyDefinitionByCode(account.profile && account.profile.currency),
  emailRecords: (account) => account.emails,
  firstName: (account) => account.profile.firstName,
  groups,
  lastName: (account) => account.profile.lastName,
  language: (account) => account.profile.language,
  name: (account) => account.profile.name || account.name,
  picture: (account) => account.profile.picture,
  preferences: (account) => _.get(account, "profile.preferences"),
  primaryEmailAddress: (account) => {
    const primaryRecord = (account.emails || []).find((record) => record.provides === "default");
    return (primaryRecord && primaryRecord.address) || "";
  },
  username: (account) => account.profile.username || account.username
};
