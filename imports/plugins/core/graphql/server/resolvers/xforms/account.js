import { assoc, assocPath, dissoc, pathOr, pipe } from "ramda";
import { getPaginatedResponse, namespaces } from "@reactioncommerce/reaction-graphql-utils";
import { assocInternalId, assocOpaqueId, decodeOpaqueIdForNamespace, encodeOpaqueId } from "./id";
import { renameKeys } from "./ramda-ext";

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

export const mergeAddressBookFromProfile = (item) => {
  const value = pathOr(null, ["profile", "addressBook"], item);
  return assoc("addressBook", value, item);
};

export const mergeCurrencyFromProfile = (item) => {
  const value = pathOr(null, ["profile", "currency"], item);
  return assoc("currency", value, item);
};

export const mergePreferencesFromProfile = (item) => {
  const value = pathOr(null, ["profile", "preferences"], item);
  return assoc("preferences", value, item);
};

/* Composed function that fully transforms the Account for response. */
export const xformAccountResponse = pipe(
  assocAccountOpaqueId,
  dissoc("acceptsMarketing"),
  dissoc("sessions"),
  dissoc("state"),
  dissoc("username"),
  mergeAddressBookFromProfile,
  mergeCurrencyFromProfile,
  mergePreferencesFromProfile,
  renameKeys({ emails: "emailRecords" }),
  dissoc("profile")
);

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

export const getPaginatedAccountResponse = getPaginatedResponse(xformAccountResponse);
