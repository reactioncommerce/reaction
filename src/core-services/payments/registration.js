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
