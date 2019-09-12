/**
 * Deprecated. This file is here for custom plugin backward compatibility.
 * Delete this when there is a 3.0.0 release.
 */
import mergeResource from "/imports/plugins/core/i18n/server/no-meteor/translations";

/**
 * @summary Load an array of translation arrays
 * @deprecated Use new method of passing `i18n.translations` array to `registerPlugin`
 * @param {Array<Object[]>} translations Array of arrays of i18next translation objects
 * @return {undefined}
 */
export function loadTranslations(translations) {
  if (!Array.isArray(translations)) throw new Error("loadTranslations expects first argument to be an array");

  translations.forEach((trns) => {
    if (!Array.isArray(trns)) throw new Error("loadTranslations expects first argument to be an array of arrays");
    trns.forEach(mergeResource);
  });
}
