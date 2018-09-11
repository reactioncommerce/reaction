import accounting from "accounting-js";
import { assoc, compose, map, toPairs } from "ramda";
import { namespaces } from "@reactioncommerce/reaction-graphql-utils";
import { assocInternalId, assocOpaqueId, decodeOpaqueIdForNamespace, encodeOpaqueId } from "./id";

export const assocProductInternalId = assocInternalId(namespaces.Product);
export const assocProductOpaqueId = assocOpaqueId(namespaces.Product);
export const decodeProductOpaqueId = decodeOpaqueIdForNamespace(namespaces.Product);
export const encodeProductOpaqueId = encodeOpaqueId(namespaces.Product);

// add `currencyCode` keys to each pricing info object
const xformPricingEntry = ([k, v]) => compose(assoc("currencyCode", k))(v);

// map over all provided pricing info, provided in the format stored in our Catalog collection,
// and convert them to an array
export const xformPricingArray = compose(map(xformPricingEntry), toPairs);

/**
 * @name xformCurrencyExchangePricing
 * @summary Converts prices and adds currencyExchangePricing to result
 * @param {Object} pricing Original pricing object
 * @param {String} currencyCode Code of currency to convert prices to
 * @param {Object} context Object containing per-request state
 */
export const xformCurrencyExchangePricing = async (pricing, currencyCode, context) => {
  const { shopId } = context;
  const shop = await context.queries.shops.shopById(context, shopId);
  const currency = shop.currencies[currencyCode];

  const { rate } = currency;

  pricing.forEach((pricingItem) => {
    const { price, minPrice, maxPrice } = pricingItem;
    const priceConverted = price && (price * rate);
    const minPriceConverted = minPrice && (minPrice * rate);
    const maxPriceConverted = maxPrice && (maxPrice * rate);

    let displayPrice = "";
    if (minPrice && maxPrice) {
      const minFormatted = accounting.formatMoney(minPriceConverted, currency);
      const maxFormatted = accounting.formatMoney(maxPriceConverted, currency);
      displayPrice = `${minFormatted} - ${maxFormatted}`;
    } else {
      const priceFormatted = accounting.formatMoney(priceConverted, currency);
      displayPrice = priceFormatted;
    }

    pricingItem.currencyExchangePricing = {
      displayPrice,
      price: priceConverted,
      minPrice: minPriceConverted,
      maxPrice: maxPriceConverted,
      currency: {
        code: currencyCode
      }
    };
  });

  return pricing;
};
