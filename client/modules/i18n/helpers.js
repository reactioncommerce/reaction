import { Template } from "meteor/templating";
import { Reaction, Logger, i18next } from "/client/api";
import { Shops } from "/lib/collections";
import { localeDep, i18nextDep } from  "./main";
import { formatPriceString } from "./currency";

/**
 * i18n
 * see: http://i18next.com/
 * pass the translation key as the first argument
 * and the default message as the second argument
 * @param {String} i18nKey - i18nKey
 * @param {String} i18nMessage - message text
 * @example {{i18n "accountsTemplate.error" "Invalid Email"}}
 * @return {String} returns i18n translated message
 */
Template.registerHelper("i18n", function (i18nKey, i18nMessage) {
  if (!i18nKey || typeof i18nMessage !== "string") {
    Logger.warn("i18n key string required to translate", i18nKey, i18nMessage);
    return "";
  }
  check(i18nKey, String);
  check(i18nMessage, String);

  i18nextDep.depend();

  // returning translated key
  return i18next.t(i18nKey, { defaultValue: i18nMessage });
});

/**
 * currencySymbol
 * @summary return shop /locale specific currency format (ie: $)
 * @returns {String} return current locale currency symbol
 */
Template.registerHelper("currencySymbol", function () {
  const locale = Reaction.Locale.get();
  const localStorageCurrency = localStorage.getItem("currency");
  if (localStorageCurrency) {
    const shop = Shops.findOne();
    if (Match.test(shop, Object) && shop.currencies) {
      return shop.currencies[localStorageCurrency].symbol;
    }
  }
  return locale.currency.symbol;
});

/**
 * formatPrice
 * @summary return shop /locale specific formatted price
 * also accepts a range formatted with " - "
 * @param {String} currentPrice - currentPrice or "xx.xx - xx.xx" formatted String
 * @param {Boolean} useDefaultShopCurrency - flag for displaying shop's currency in Admin view of PDP
 * @return {String} returns locale formatted and exchange rate converted values
 */
Template.registerHelper("formatPrice", function (formatPrice, useDefaultShopCurrency) {
  localeDep.depend();
  return formatPriceString(formatPrice, useDefaultShopCurrency);
});
