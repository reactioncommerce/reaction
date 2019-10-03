import { mergeResource } from "./translations.js";

/**
 * @summary Will be called for every plugin
 * @param {Object} options The options object that the plugin passed to registerPackage
 * @returns {undefined}
 */
export function registerPluginHandler({ i18n, name }) {
  if (i18n) {
    const { translations } = i18n;
    if (!Array.isArray(translations)) throw new Error(`Plugin ${name} registered i18n.translations that is not an array`);

    translations.forEach(mergeResource);
  }
}
