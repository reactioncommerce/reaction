export const taxServices = {};

/**
 * @summary Will be called for every plugin
 * @param {Object} options The options object that the plugin passed to registerPackage
 * @returns {undefined}
 */
export function registerPluginHandler({ name: pluginName, taxServices: pluginTaxServices }) {
  if (Array.isArray(pluginTaxServices)) {
    for (const pluginTaxService of pluginTaxServices) {
      taxServices[pluginTaxService.name] = { ...pluginTaxService, pluginName };
    }
  }
}
