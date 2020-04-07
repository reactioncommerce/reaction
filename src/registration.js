export const addressValidationServices = {};

/**
 * @summary Will be called for every plugin
 * @param {Object} options The options object that the plugin passed to registerPackage
 * @returns {undefined}
 */
export function registerPluginHandlerForAddress({
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
 * @param {String} countryCode The country code of the address to be validated
 * @returns {Object[]} The first enabled validation services for the shop with ID `shopId`
 *   that supports countryCode.
 */
export async function getAddressValidationService(context, shopId, countryCode) {
  // First find all service rules that specify this shop ID and country code combination.
  // Service rules that have no `countryCodes` value apply to all countries.
  const rules = await context.collections.AddressValidationRules.find({
    shopId,
    $or: [
      { countryCodes: null },
      { countryCodes: countryCode }
    ]
  }).toArray();

  // Then verify that each specified service actually supports validating this country
  const validRules = rules.filter(({ serviceName }) => {
    const registeredService = addressValidationServices[serviceName];
    if (!registeredService) {
      throw new Error(`The shop has address validation service "${serviceName}" enabled, but no such service exists. ` +
        "Did you forget to install the plugin that provides this service?");
    }
    return (
      !Array.isArray(registeredService.supportedCountryCodes) ||
      registeredService.supportedCountryCodes.includes(countryCode)
    );
  });

  if (validRules.length === 0) return null;

  // Use the first valid rule
  return addressValidationServices[validRules[0].serviceName];
}
