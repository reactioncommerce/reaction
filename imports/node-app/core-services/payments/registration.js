export const paymentMethods = {};

/**
 * @summary Will be called for every plugin
 * @param {Object} options The options object that the plugin passed to registerPackage
 * @returns {undefined}
 */
export function registerPluginHandler({ name: pluginName, paymentMethods: pluginPaymentMethods }) {
  if (Array.isArray(pluginPaymentMethods)) {
    for (const pluginPaymentMethod of pluginPaymentMethods) {
      paymentMethods[pluginPaymentMethod.name] = { ...pluginPaymentMethod, pluginName };
    }
  }
}

/**
 * @name getPaymentMethodConfigByName
 * @param {String} name payment method name, e.g. example, stripe_card
 * @returns {Object} payment method configuration
 */
export function getPaymentMethodConfigByName(name) {
  const config = paymentMethods[name];
  if (!config) {
    throw new Error(`Configuration not found for ${name} payment method. Did you remove the plugin that provides this payment method?`);
  }
  return config;
}
