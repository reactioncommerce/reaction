import { get } from "lodash";

export const addressValidationServices = {};

/**
 * @summary Will be called for every plugin
 * @param {Object} options The options object that the plugin passed to registerPackage
 * @returns {undefined}
 */
export function registerPluginHandler({
  name: pluginName,
  addressValidationServices: pluginAddressValidationServices
}) {
  if (Array.isArray(pluginAddressValidationServices)) {
    for (const pluginAddressValidationService of pluginAddressValidationServices) {
      addressValidationServices[pluginAddressValidationService.name] = {
        ...pluginAddressValidationService,
        pluginName
      };
    }
  }
}

/**
 * @param {Object} context The app context
 * @param {String} shopId The shop ID
 * @returns {Object[]} The enabled validation services for the shop with ID `shopId`
 */
export async function getEnabledAddressValidationServicesForShop(context, shopId) {
  const plugin = await context.collections.Packages.findOne({ name: "reaction-address", shopId });
  if (!plugin) return [];

  return get(plugin, "settings.addressValidation.enabledServices", []);
}

/**
 * @param {Object} context The app context
 * @param {String} shopId The shop ID
 * @param {String} countryCode The country code of the address to be validated
 * @returns {Object[]} The first enabled validation services for the shop with ID `shopId`
 *   that supports countryCode.
 */
export async function getAddressValidationService(context, shopId, countryCode) {
  const services = await getEnabledAddressValidationServicesForShop(context, shopId);
  const supportedServices = services.filter(({ serviceName }) => {
    const registeredService = addressValidationServices[serviceName];
    if (!registeredService) {
      throw new Error(`The shop has address validation service "${serviceName}" enabled but no such service exists. ` +
        "Did you forget to install the plugin that provides this service?");
    }
    return (
      !Array.isArray(registeredService.supportedCountryCodes) ||
      registeredService.supportedCountryCodes.includes(countryCode)
    );
  });
  const foundService = supportedServices.find((service) => !Array.isArray(service.countryCodes) || service.countryCodes.includes(countryCode));
  if (!foundService) return null;
  return addressValidationServices[foundService.serviceName];
}
