import accounting from "accounting-js";
import CurrencyDefinitions from "./CurrencyDefinitions";

/**
 * A wrapper around accounting.formatMoney that handles minor differences between Reaction
 * API and accounting.js API.
 * @param {Number} price - A price (float)
 * @param {String} [currencyCode] - A currency code
 * @returns {String} Formatted currency string such as "$15.99". If currency code isn't recognized,
 *   returns `accounting.toFixed(price, 2)`.
 */
export default function formatMoney(price, currencyCode = "USD") {
  const currencyInfo = CurrencyDefinitions[currencyCode];

  // Implementation of toFixed() that treats floats more like decimal values than binary,
  // fixing inconsistent precision rounding in JavaScript (where some .05 values round up,
  // while others round down):
  if (!currencyInfo) return accounting.toFixed(price, 2);

  // If there are no decimal places, in the case of the Japanese Yen, we adjust it here.
  let priceToFormat = price;
  if (currencyInfo.scale === 0) {
    priceToFormat = price * 100;
  }

  const currencyFormatSettings = { ...currencyInfo };

  // Precision is mis-used in accounting js. Scale is the proper term for number
  // of decimal places. Let's adjust it here so accounting.js does not break.
  if (typeof currencyInfo.scale === "number") {
    currencyFormatSettings.precision = currencyInfo.scale;
  }

  return accounting.formatMoney(priceToFormat, currencyFormatSettings);
}
