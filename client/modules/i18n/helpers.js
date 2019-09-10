import { Template } from "meteor/templating";
import { check } from "meteor/check";
import { findCurrency, Logger, i18next } from "/client/api";
import { i18nextDep } from "./main";

/**
 * @name i18n
 * @see http://i18next.com/
 * @summary Pass the translation key as the first argument and the default message as the second argument
 * @memberof BlazeTemplateHelpers
 * @method
 * @param {String} i18nKey - i18nKey
 * @param {String} i18nMessage - message text
 * @example {{i18n "accountsTemplate.error" "Invalid Email"}}
 * @returns {String} returns i18n translated message
 */
Template.registerHelper("i18n", (i18nKey, i18nMessage) => {
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
 * @name currencySymbol
 * @memberof BlazeTemplateHelpers
 * @method
 * @summary Return shop /locale specific currency format (ie: $)
 * @returns {String} return current locale currency symbol
 */
Template.registerHelper("currencySymbol", () => {
  const currency = findCurrency(null, true);

  return (currency && currency.symbol) || "$";
});
