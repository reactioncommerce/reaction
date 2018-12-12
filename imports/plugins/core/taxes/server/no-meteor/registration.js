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
 * @returns {Object} An object containing the definitions from registerPackage for the
 *   active and fallback tax services currently enabled for the shop with ID `shopId`.
 */
export async function getTaxServicesForShop(context, shopId) {
  const plugin = await context.collections.Packages.findOne({ name: "reaction-taxes", shopId });
  if (!plugin) return {};

  const { activeTaxServiceName, fallbackTaxServiceName } = plugin.settings || {};
  if (!activeTaxServiceName) return {}; // at least an active must be set

  const activeTaxService = taxServices[activeTaxServiceName];
  const fallbackTaxService = taxServices[fallbackTaxServiceName];

  if (!activeTaxService) {
    throw new Error(`Active tax service is "${activeTaxServiceName}" but no such service exists. ` +
      "Did you forget to install the plugin that provides this service?");
  }

  if (fallbackTaxServiceName && !fallbackTaxService) {
    throw new Error(`Fallback tax service is "${fallbackTaxServiceName}" but no such service exists. ` +
      "Did you forget to install the plugin that provides this service?");
  }

  return { activeTaxService, fallbackTaxService };
}
