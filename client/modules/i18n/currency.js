import accounting from "accounting-js";
import { Meteor } from "meteor/meteor";
import { Reaction, Logger } from "/client/api";
import { Shops } from "/lib/collections";
import { currencyDep } from "./main";

/**
 * findCurrency
 * private function for returning localStorage currency
 * @param   {Object}  defaultCurrency    The default currency
 * @param {Boolean} useDefaultShopCurrency - flag for displaying shop's currency in Admin view of PDP
 * @return  {Object}  localStorageCurrency The localStorage currency
 */
function findCurrency(defaultCurrency, useDefaultShopCurrency) {
  const shop = Shops.findOne(Reaction.getShopId(), {
    fields: {
      currencies: 1,
      currency: 1
    }
  });
  const localStorageCurrencyName = localStorage.getItem("currency");
  if (typeof shop === "object" && shop.currencies && localStorageCurrencyName) {
    let localStorageCurrency = {};
    if (shop.currencies[localStorageCurrencyName]) {
      if (useDefaultShopCurrency) {
        localStorageCurrency = shop.currencies[shop.currency];
        localStorageCurrency.exchangeRate = 1;
      } else {
        localStorageCurrency = shop.currencies[localStorageCurrencyName];
        localStorageCurrency.exchangeRate = shop.currencies[localStorageCurrencyName].rate;
      }
    }
    return localStorageCurrency;
  }
  return defaultCurrency;
}

/**
 * formatPriceString
 * @summary return shop /locale specific formatted price
 * also accepts a range formatted with " - "
 * @param {String} formatPrice - currentPrice or "xx.xx - xx.xx" formatted String
 * @param {Boolean} useDefaultShopCurrency - flag for displaying shop's currency in Admin view of PDP
 * @return {String} returns locale formatted and exchange rate converted values
 */
export function formatPriceString(formatPrice, useDefaultShopCurrency) {
  let defaultShopCurrency = useDefaultShopCurrency;

  // in case useDefaultShopCurrency is a Spacebars.kw we have this check
  if (typeof useDefaultShopCurrency === "object" || !useDefaultShopCurrency) {
    defaultShopCurrency = false;
  }

  currencyDep.depend();
  const locale = Reaction.Locale.get();

  if (typeof locale !== "object" || typeof locale.currency !== "object") {
    // locale not yet loaded, so we don"t need to return anything.
    return false;
  }

  if (typeof formatPrice !== "string" && typeof formatPrice !== "number") {
    return false;
  }

  // uses the localStorage currency instead of locale
  const userCurrency = findCurrency(locale.currency, defaultShopCurrency);

  // for the cases then we have only one price. It is a number.
  const currentPrice = formatPrice.toString();
  let price = 0;
  const prices = ~currentPrice.indexOf(" - ") ?
    currentPrice.split(" - ") : [currentPrice];

  // basic "for" is faster then "for ...of" for arrays. We need more speed here
  const len = prices.length;
  for (let i = 0; i < len; i++) {
    const originalPrice = prices[i];
    try {
      // we know the locale, but we don"t know exchange rate. In that case we
      // should return to default shop currency
      if (typeof userCurrency.rate !== "number") {
        throw new Meteor.Error("exchangeRateUndefined");
      }
      prices[i] *= userCurrency.rate;

      price = _formatPrice(price, originalPrice, prices[i],
        currentPrice, userCurrency, i, len);
    } catch (error) {
      Logger.debug("currency error, fallback to shop currency");
      price = _formatPrice(price, originalPrice, prices[i],
        currentPrice, locale.shopCurrency, i, len);
    }
  }
  return price;
}

export function formatNumber(currentPrice) {
  const locale = Reaction.Locale.get();
  let price = currentPrice;
  const format = Object.assign({}, locale.currency, {
    format: "%v"
  });
  const shopFormat = Object.assign({}, locale.shopCurrency, {
    format: "%v"
  });

  if (typeof locale.currency === "object" && locale.currency.rate) {
    price = currentPrice * locale.currency.rate;
    return accounting.formatMoney(price, format);
  }

  Logger.debug("currency error, fallback to shop currency");
  return accounting.formatMoney(currentPrice, shopFormat);
}

/**
 * _formatPrice
 * private function for formatting locale currency
 * @private
 * @param  {Number} price         price
 * @param  {Number} originalPrice originalPrice
 * @param  {Number} actualPrice   actualPrice
 * @param  {Number} currentPrice  currentPrice
 * @param  {Number} currency      currency
 * @param  {Number} pos           position
 * @param  {Number} len           length
 * @return {Number}               formatted price
 */
function _formatPrice(price, originalPrice, actualPrice, currentPrice, currency,
  pos, len) {
  // this checking for locale.shopCurrency mostly
  if (typeof currency !== "object") {
    return false;
  }

  let adjustedPrice = actualPrice;
  let formattedPrice;

  // Precision is mis-used in accounting js. Scale is the propery term for number
  // of decimal places. Let's adjust it here so accounting.js does not break.
  if (currency.scale !== undefined) {
    currency.precision = currency.scale;
  }

  // If there are no decimal places, in the case of the Japanese Yen, we adjust it here.
  if (currency.scale === 0) {
    adjustedPrice = actualPrice * 100;
  }

  // @param {string} currency.where: If it presents - in situation then two
  // prices in string, currency sign will be placed just outside the right price.
  // For now it should be manually added to fixtures shop data.
  if (typeof currency.where === "string" && currency.where === "right" &&
    len > 1 && pos === 0) {
    const modifiedCurrency = Object.assign({}, currency, {
      symbol: ""
    });
    formattedPrice = accounting.formatMoney(adjustedPrice, modifiedCurrency);
  } else {
    // accounting api: http://openexchangerates.github.io/accounting.js/
    formattedPrice = accounting.formatMoney(adjustedPrice, currency);
  }

  return price === 0 ? currentPrice.replace(originalPrice, formattedPrice) : price.replace(originalPrice, formattedPrice);
}
