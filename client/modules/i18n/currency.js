import { formatMoney } from "accounting-js";
import { Reaction } from "/client/api";
import { Shops, Accounts } from "/lib/collections";
import { currencyDep } from "./main";

/**
 * @name findCurrency
 * @summary Private function for returning user currency
 * @private
 * @param {Object}  defaultCurrency    The default currency
 * @param {Boolean} useDefaultShopCurrency - flag for displaying shop's currency in Admin view of PDP
 * @returns {Object}  user currency or shop currency if none is found
 */
export function findCurrency(defaultCurrency, useDefaultShopCurrency) {
  const shop = Shops.findOne(Reaction.getPrimaryShopId(), {
    fields: {
      currencies: 1,
      currency: 1
    }
  });

  const shopCurrency = (shop && shop.currency) || "USD";
  const user = Accounts.findOne({
    _id: Reaction.getUserId()
  });
  const profileCurrency = user && user.profile && user.profile.currency;
  if (typeof shop === "object" && shop.currencies && profileCurrency) {
    let userCurrency = {};
    if (shop.currencies[profileCurrency]) {
      if (useDefaultShopCurrency) {
        userCurrency = shop.currencies[shop.currency];
        userCurrency.exchangeRate = 1;
      } else {
        userCurrency = shop.currencies[profileCurrency];
        userCurrency.exchangeRate = shop.currencies[profileCurrency].rate;
      }
    }
    return userCurrency;
  }
  return shop.currencies[shopCurrency];
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
  currencyDep.depend();
  const locale = Reaction.Locale.get();

  if (typeof locale !== "object" || typeof locale.currency !== "object") {
    // locale not yet loaded, so we don"t need to return anything.
    return false;
  }

  if (typeof formatPrice !== "string" && typeof formatPrice !== "number") {
    return false;
  }

  // get user currency instead of locale currency
  const userCurrency = findCurrency(locale.currency, true);

  const currentPrice = formatPrice.toString();
  const prices = currentPrice.indexOf(" - ") >= 0 ?
    currentPrice.split(" - ") : [currentPrice, currentPrice];

  // Remove commas
  const price1 = prices[0].replace(/,/g, "");
  const price2 = prices[1].replace(/,/g, "");

  return getDisplayPrice(Number(price1), Number(price2), userCurrency);
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
