import { toFixed } from "accounting-js";
import { assoc, compose, map, toPairs } from "ramda";
import ReactionError from "@reactioncommerce/reaction-error";
import CurrencyDefinitions from "/imports/plugins/core/core/lib/CurrencyDefinitions";
import { namespaces } from "@reactioncommerce/reaction-graphql-utils";
import getDisplayPrice from "/imports/plugins/core/catalog/server/no-meteor/utils/getDisplayPrice";
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

/**
 * @name xformCurrencyExchangePricing
 * @method
 * @memberof GraphQL/Transforms
 * @summary Converts price to the supplied currency and adds currencyExchangePricing to result
 * @param {Object} pricing Original pricing object
 * @param {String} currencyCode Code of currency to convert prices to
 * @param {Object} context Object containing per-request state
 * @returns {Object} New pricing object with converted prices
 */
export async function xformCurrencyExchangePricing(pricing, currencyCode, context) {
  const { shopId } = context;
  const shop = await context.queries.shopById(context, shopId);

  if (!currencyCode) {
    currencyCode = shop.currency; // eslint-disable-line no-param-reassign
  }

  const currencyInfo = shop.currencies[currencyCode];
  const { rate } = currencyInfo;

  // Stop processing if we don't have a valid currency exchange rate.
  // rate may be undefined if Open Exchange Rates or an equivalent service is not configured properly.
  if (typeof rate !== "number") {
    Logger.warn("Currency exchange rates are not available. Exchange rate fetching may not be configured.")
    return null;
  }

  const { compareAtPrice, price, minPrice, maxPrice } = pricing;
  const compareAtPriceConverted = compareAtPrice && Number(toFixed(compareAtPrice * rate, 2));
  const priceConverted = price && Number(toFixed(price * rate, 2));
  const minPriceConverted = minPrice && Number(toFixed(minPrice * rate, 2));
  const maxPriceConverted = maxPrice && Number(toFixed(maxPrice * rate, 2));
  const displayPrice = getDisplayPrice(minPriceConverted, maxPriceConverted, currencyInfo);

  return {
    compareAtPrice: {
      amount: compareAtPriceConverted || 0,
      currencyCode
    },
    displayPrice,
    price: priceConverted,
    minPrice: minPriceConverted,
    maxPrice: maxPriceConverted,
    currency: {
      code: currencyCode
    }
  };
}
