import { paymentMethods as paymentMethodList } from "/imports/plugins/core/core/server/no-meteor/pluginRegistration";

/**
 * @name paymentMethods
 * @method
 * @memberof Payments/NoMeteorQueries
 * @summary get list of all registered payment methods for a shop
 * @param {Object} context - an object containing the per-request state
 * @param {String} shopId - shop ID for which to get payment methods
 * @return {Object[]} Array of PaymentMethods
 */
export default async function paymentMethods(context, shopId) {
  const shop = await context.queries.shopById(context, shopId);
  const availablePaymentMethods = shop.availablePaymentMethods || [];

  return Object.keys(paymentMethodList)
    .map((name) => ({
      ...paymentMethodList[name],
      isEnabled: availablePaymentMethods.includes(name)
    }));
}
