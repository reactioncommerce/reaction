/**
 * @name getStripeApi
 * @param {Object} context - an object containing the per-request state
 * @param {String} paymentPluginName - plugin name
 * @param {String} shopId Shop ID
 * @returns {String} Stripe key
 */
export default async function getStripeApi(context, paymentPluginName, shopId) {
  const { collections: { Packages } } = context;
  const stripePackage = await Packages.findOne({ name: paymentPluginName, shopId });
  if (!stripePackage) throw new Error(`No package found with name ${paymentPluginName}`);
  const stripeKey = stripePackage.settings.api_key || stripePackage.settings.connectAuth.access_token;
  return stripeKey;
}
