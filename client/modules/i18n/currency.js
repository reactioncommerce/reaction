import { formatMoney } from "accounting-js";
import { Reaction } from "/client/api";
import { Shops, Accounts } from "/lib/collections";
import CurrencyDefinitions from "/imports/utils/CurrencyDefinitions";

/**
 * @name findCurrency
 * @summary Return user currency
 * @returns {Object}  user currency or shop currency if none is found
 */
export function findCurrency() {
  const shop = Shops.findOne({ _id: Reaction.getPrimaryShopId() }, {
    fields: {
      currency: 1
    }
  });

  const shopCurrency = (shop && shop.currency) || "USD";
  const user = Accounts.findOne({
    _id: Reaction.getUserId()
  });
  const profileCurrencyCode = user && user.profile && user.profile.currency;
  let currency = CurrencyDefinitions[profileCurrencyCode || shopCurrency];
  if (!currency) throw new Error(`Currency definition not found for ${profileCurrencyCode || shopCurrency}`);

  // Clone before mutating
  currency = Object.assign({}, currency, { exchangeRate: currency.rate || 1 });

  return currency;
}

/**
 * @name formatPriceString
 * @deprecated Slowly migrating everything to use `formatMoney` from "/imports/utils/formatMoney" instead
 * @summary Return shop/locale specific formatted price. Also accepts a range formatted with " - ".
 * @memberof i18n
 * @method
 * @param {String} formatPrice - currentPrice or "xx.xx - xx.xx" formatted String
 * @returns {String} returns locale formatted and exchange rate converted values
 */
export function formatPriceString(formatPrice) {
  if (typeof formatPrice !== "string" && typeof formatPrice !== "number") {
    return false;
  }

  const currency = findCurrency();

  const currentPrice = formatPrice.toString();
  const prices = currentPrice.indexOf(" - ") >= 0 ?
    currentPrice.split(" - ") : [currentPrice, currentPrice];

  // Remove commas
  const price1 = prices[0].replace(/,/g, "");
  const price2 = prices[1].replace(/,/g, "");

  return getDisplayPrice(Number(price1), Number(price2), currency);
}

/**
 * @name getDisplayPrice
 * @method
 * @summary Returns a price for front-end display in the given currency
 * @param {Number} minPrice Minimum price
 * @param {Number} maxPrice Maximum price
 * @param {Object} currencyInfo Currency object from Reaction shop schema
 * @returns {String} Display price with currency symbol(s)
 */
function getDisplayPrice(minPrice, maxPrice, currencyInfo = { symbol: "" }) {
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
