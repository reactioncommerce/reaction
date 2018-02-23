import i18next from "i18next";
import { values } from "lodash";
import SimpleSchema from "simpl-schema";
import { Meteor } from "meteor/meteor";
import { Tracker } from "meteor/tracker";
import { Reaction } from "/client/api";

/**
 * @file **Internationalization**
 * Methods and template helpers for i18n, translations, right-to-left (RTL) and currency exchange support
 * @namespace i18n
 */

/**
 * @name getBrowserLanguage
 * @method
 * @memberof i18n
 * @summary Detects device default language
 * @return {String} language code
 */
export function getBrowserLanguage() {
  if (typeof navigator.languages !== "undefined") {
    if (navigator.languages[0].indexOf("-") >= 0) {
      return navigator.languages[0].split("-")[0];
    } else if (navigator.languages[0].indexOf("_") >= 0) {
      return navigator.languages[0].split("_")[0];
    }
    return navigator.languages[0];
  }
  return navigator.language || navigator.browserLanguage;
}

/**
 * @name getLabelsFor
 * @method
 * @memberof i18n
 * @summary Get Labels for simple.schema keys
 * @param  {Object} schema - schema
 * @param  {String} name - name
 * @return {Object} return schema label object
 */
export function getLabelsFor(schema, name) {
  const titleCaseName = name.charAt(0).toLowerCase() + name.slice(1);
  const labels = {};
  // loop through all the rendered form fields and generate i18n keys
  Object.keys(schema.mergedSchema()).forEach((fieldName) => {
    const i18nKey = `${titleCaseName}.${fieldName.split(".$").join("")}`;
    // translate autoform label
    const t = i18next.t(i18nKey);
    if (t && new RegExp("string").test(t) !== true && t !== i18nKey) {
      labels[fieldName] = t;
    }
  });
  return labels;
}

/**
 * @name getValidationErrorMessages
 * @method
 * @memberof i18n
 * @summary Get i18n messages for autoform messages. Currently using a globalMessage namespace only.
 * 1. Use schema-specific message for specific key
 * 2. Use schema-specific message for generic key
 * 3. Use schema-specific message for type
 * @todo Implement messaging hierarchy from simple-schema
 * @return {Object} returns i18n translated message for schema labels
 */
export function getValidationErrorMessages() {
  const messages = {};
  values(SimpleSchema.ErrorTypes).forEach((errorType) => {
    const i18nKey = `globalMessages.${errorType}`;
    const message = i18next.t(i18nKey);
    if (new RegExp("string").test(message) !== true && message !== i18nKey) {
      messages[errorType] = message;
    }
  });
  return messages;
}

// set language and autorun on change of language
// initialize i18n and load data resources for the current language and fallback "EN"
export const i18nextDep = new Tracker.Dependency();
export const localeDep = new Tracker.Dependency();
export const currencyDep = new Tracker.Dependency();

Meteor.startup(() => {
  Tracker.autorun((c) => {
    let merchantShopsReadyOrSkipped = false;

    // Choose shopSubscription based on marketplace settings
    if (Reaction.marketplaceEnabled && Reaction.merchantLanguage) {
      merchantShopsReadyOrSkipped = Reaction.Subscriptions.MerchantShops.ready();
    } else {
      merchantShopsReadyOrSkipped = true;
    }

    // setting local and active packageNamespaces
    // packageNamespaces are used to determine i18n namespace
    if (Reaction.Subscriptions.PrimaryShop.ready() && merchantShopsReadyOrSkipped) {
      // use i18n detected language to getLocale info and set it client side
      Meteor.call("shop/getLocale", (error, result) => {
        if (result) {
          const locale = result;
          locale.language = getBrowserLanguage();

          Reaction.Locale.set(locale);
          localeDep.changed();

          // Stop the tracker
          c.stop();
        }
      });
    }
  });
});

export default i18next;
