import { paymentMethods } from "/imports/plugins/core/core/server/no-meteor/pluginRegistration";

/**
 * @name availablePaymentMethods
 * @method
 * @memberof Payments/NoMeteorQueries
 * @summary get list of all available payment methods for a shop
 * @param {Object} context - an object containing the per-request state
 * @param {String} shopId - shop id for which to get payment methods
 * @return {Array<Object>} Array of PaymentMethods
 */
export default async function availablePaymentMethods(context, shopId) {
  const shop = await context.queries.shopById(context, shopId);
  const availableMethods = shop.availablePaymentMethods || [];

  return availableMethods
    .map((name) => ({
      ...paymentMethods[name],
      isEnabled: true
    }));
}
