import { formatMoney } from "accounting-js";

/**
 * @name getDisplayPrice
 * @method
 * @summary Returns a price for front-end display in the given currency
 * @param {Number} minPrice Minimum price
 * @param {Number} maxPrice Maximum price
 * @param {Object} currencyInfo Currency object from Reaction shop schema
 * @returns {String} Display price with currency symbol(s)
 */
export default function getDisplayPrice(minPrice, maxPrice, currencyInfo = { symbol: "" }) {
  let displayPrice;

  if (minPrice === maxPrice) {
    // Display 1 price (min = max)
    displayPrice = formatMoney(minPrice, currencyInfo);
  } else {
    // Display range
    let minFormatted;

    // Account for currencies where only one currency symbol should be displayed. Ex: 680,18 - 1 359,68 руб.
    if (currencyInfo.where === "right") {
      const modifiedCurrencyInfo = Object.assign({}, currencyInfo, {
        symbol: ""
      });
      minFormatted = formatMoney(minPrice, modifiedCurrencyInfo).trim();
    } else {
      minFormatted = formatMoney(minPrice, currencyInfo);
    }

    const maxFormatted = formatMoney(maxPrice, currencyInfo);
    displayPrice = `${minFormatted} - ${maxFormatted}`;
  }

  return displayPrice;
}
