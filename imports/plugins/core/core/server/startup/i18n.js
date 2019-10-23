/**
 * Deprecated. This file is here for custom plugin backward compatibility.
 * Delete this when there is a 3.0.0 release.
 */
import Logger from "@reactioncommerce/logger";
import { mergeResource } from "/imports/node-app/core-services/i18n/translations.js";

/**
 * @summary Load an array of translation arrays
 * @deprecated Use new method of passing `i18n.translations` array to `registerPlugin`
 * @param {Array<Object[]>} translations Array of arrays of i18next translation objects
 * @return {undefined}
 */
export function loadTranslations(translations) {
  Logger.warn("Calling loadTranslations to load translations is deprecated. " +
    "This function will be removed in the next major release. Pass an 'i18n' object " +
    "with your 'registerPlugin' call instead. Look at any built-in plugin for an example.");
  if (!Array.isArray(translations)) throw new Error("loadTranslations expects first argument to be an array");

  translations.forEach((trns) => {
    if (!Array.isArray(trns)) throw new Error("loadTranslations expects first argument to be an array of arrays");
    trns.forEach(mergeResource);
  });
}
