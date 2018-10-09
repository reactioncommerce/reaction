import { paymentMethods } from "/imports/plugins/core/core/server/no-meteor/pluginRegistration";

/**
 * @name availablePaymentMethods
 * @method
 * @memberof Payments/NoMeteorQueries
 * @summary TODO: query the Groups collection and return a MongoDB cursor
 * @param {Object} context - an object containing the per-request state
 * @param {String} shopId - shop ID for which to get payment methods
 * @return {Object[]} TODO: Groups collection cursor
 */
export default async function (context, shopId) {
  const shop = await context.queries.shopById(context, shopId);
  const paymentMethodNames = Object.keys(paymentMethods);

  return shop.availablePaymentMethods
    .map((name) => paymentMethodNames.find((paymentMethodName) => paymentMethodName === name));
}
