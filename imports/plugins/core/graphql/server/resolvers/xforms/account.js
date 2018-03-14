import { assoc, dissoc, pathOr, pipe } from "ramda";
import { assocOpaqueId, encodeOpaqueId } from "./id";
import { renameKeys } from "./ramda-ext";

/* Namespace specific ID functions for Address.
 * These functions use the power of currying to build existing functionality
 * with simple interfaces on existing functions.
 */
export const accountNs = "reaction/account";
export const encodeAccountOpaqueId = encodeOpaqueId(accountNs);
export const assocAccountOpaqueId = assocOpaqueId(accountNs);

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
  dissoc("taxSettings"),
  dissoc("username"),
  mergeAddressBookFromProfile,
  mergeCurrencyFromProfile,
  mergePreferencesFromProfile,
  renameKeys({ emails: "emailRecords" }),
  dissoc("profile")
);
