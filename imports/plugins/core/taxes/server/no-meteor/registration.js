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

/**
 * @param {Object} context The app context
 * @param {String} shopId The shop ID
 * @returns {Object|null} The definition from registerPackage for the tax service that is
 *   currently enabled for the shop with ID `shopId`
 */
export async function getActiveTaxServiceForShop(context, shopId) {
  const plugin = await context.collections.Packages.findOne({ name: "reaction-taxes", shopId });
  if (!plugin) return null;

  const { activeTaxServiceName } = plugin.settings || {};
  if (!activeTaxServiceName) return null;

  const config = taxServices[activeTaxServiceName];
  if (!config) {
    throw new Error(`Active tax service is "${activeTaxServiceName}" but no such service exists. ` +
      "Did you forget to install the plugin that provides this service?");
  }

  return config;
}
