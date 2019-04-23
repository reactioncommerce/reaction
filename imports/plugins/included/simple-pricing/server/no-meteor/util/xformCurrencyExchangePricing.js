import { toFixed } from "accounting-js";
import Logger from "@reactioncommerce/logger";
import getDisplayPrice from "./getDisplayPrice";

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
export default async function xformCurrencyExchangePricing(pricing, currencyCode, context) {
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
    Logger.debug("Currency exchange rates are not available. Exchange rate fetching may not be configured.");
    return null;
  }

  const { compareAtPrice, price, minPrice, maxPrice } = pricing;
  const priceConverted = price && Number(toFixed(price * rate, 2));
  const minPriceConverted = minPrice && Number(toFixed(minPrice * rate, 2));
  const maxPriceConverted = maxPrice && Number(toFixed(maxPrice * rate, 2));
  const displayPrice = getDisplayPrice(minPriceConverted, maxPriceConverted, currencyInfo);
  let compareAtPriceConverted = null;

  if (typeof compareAtPrice === "number" && compareAtPrice > 0) {
    compareAtPriceConverted = {
      amount: Number(toFixed(compareAtPrice * rate, 2)),
      currencyCode
    };
  }

  return {
    compareAtPrice: compareAtPriceConverted,
    displayPrice,
    price: priceConverted,
    minPrice: minPriceConverted,
    maxPrice: maxPriceConverted,
    currency: {
      code: currencyCode
    }
  };
}
