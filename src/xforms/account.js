import { createRequire } from "module";
import namespaces from "@reactioncommerce/api-utils/graphql/namespaces.js";
import { assocInternalId, assocOpaqueId, decodeOpaqueIdForNamespace, encodeOpaqueId } from "./id.js";
import { renameKeys } from "./ramda-ext.js";

const require = createRequire(import.meta.url);

const { assocPath, dissoc, pipe } = require("ramda");

export const assocAccountInternalId = assocInternalId(namespaces.Account);
export const assocAccountOpaqueId = assocOpaqueId(namespaces.Account);
export const decodeAccountOpaqueId = decodeOpaqueIdForNamespace(namespaces.Account);
export const encodeAccountOpaqueId = encodeOpaqueId(namespaces.Account);

export const mergeAddressBookToProfile = (item) =>
  assocPath(["profile", "addressBook"], item.addressBook, item);

export const mergeCurrencyToProfile = (item) =>
  assocPath(["profile", "currency"], item.currency, item);

export const mergePreferencesToProfile = (item) =>
  assocPath(["profile", "preferences"], item.preferences, item);

export const xformAccountInput = pipe(
  assocAccountInternalId,
  mergeAddressBookToProfile,
  mergeCurrencyToProfile,
  mergePreferencesToProfile,
  dissoc("addressBook"),
  dissoc("currency"),
  dissoc("preferences"),
  renameKeys({ emailRecords: "emails" })
);
