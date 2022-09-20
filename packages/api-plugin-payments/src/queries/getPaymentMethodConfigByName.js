import { paymentMethods } from "../registration.js";

/**
 * @name getPaymentMethodConfigByName
 * @param {String} name payment method name, e.g. example, stripe_card
 * @returns {Object} payment method configuration
 */
export default function getPaymentMethodConfigByName(name) {
  const config = paymentMethods[name];
  if (!config) {
    throw new Error(`Configuration not found for ${name} payment method. Did you remove the plugin that provides this payment method?`);
  }
  return config;
}
