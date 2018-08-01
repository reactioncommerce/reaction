import { assoc, compose, map, toPairs } from "ramda";
import ReactionError from "/imports/plugins/core/graphql/lib/ReactionError";
import CurrencyDefinitions from "/imports/plugins/core/core/lib/CurrencyDefinitions";
import { namespaces } from "@reactioncommerce/reaction-graphql-utils";
import { assocInternalId, assocOpaqueId, decodeOpaqueIdForNamespace, encodeOpaqueId } from "./id";

export const assocCurrencyInternalId = assocInternalId(namespaces.Currency);
export const assocCurrencyOpaqueId = assocOpaqueId(namespaces.Currency);
export const decodeCurrencyOpaqueId = decodeOpaqueIdForNamespace(namespaces.Currency);
export const encodeCurrencyOpaqueId = encodeOpaqueId(namespaces.Currency);

// add `code` and `_id` keys to each currency object
const xformCurrencyEntry = ([k, v]) => compose(
  assoc("code", k),
  assoc("_id", k)
)(v);

// map over all provided currencies, provided in the format stored in our Shops collection,
// and convert them to the format that GraphQL needs
export const xformLegacyCurrencies = compose(map(xformCurrencyEntry), toPairs);

/**
 * @name getXformedCurrenciesByShop
 * @method
 * @memberof GraphQL/Transforms
 * @param {Object} shop A shop object
 * @return {Object} A potentially-empty array of currency objects for this shop
 */
export function getXformedCurrenciesByShop(shop) {
  if (!shop || !shop.currencies) return [];
  return xformLegacyCurrencies(shop.currencies);
}

/**
 * @name getXformedCurrencyByCode
 * @method
 * @memberof GraphQL/Transforms
 * @summary Get an individual transformed currency
 * @param {String} code The code that must match the `currency.code`
 * @return {Object} A Currency object
 */
export async function getXformedCurrencyByCode(code) {
  if (!code) return null;
  const entry = CurrencyDefinitions[code];
  if (!entry) throw new ReactionError("invalid", `No currency definition found for ${code}`);
  return xformCurrencyEntry([code, entry]);
}
