import ReactionError from "@reactioncommerce/reaction-error";
import { paymentMethods as paymentMethodList } from "/imports/plugins/core/core/server/no-meteor/pluginRegistration";

/**
 * @name paymentMethods
 * @method
 * @memberof Payments/NoMeteorQueries
 * @summary get list of all registered payment methods for a shop
 * @param {Object} context - an object containing the per-request state
 * @param {String} shopId - shop id for which to get payment methods
 * @return {Array<Object>} Array of PaymentMethods
 */
export default async function paymentMethods(context, shopId) {
  const shop = await context.queries.shopById(context, shopId);
  if (!shop) throw new ReactionError("not-found", "Shop not found");
  const availablePaymentMethods = shop.availablePaymentMethods || [];

  if (!context.userHasPermission(["owner", "admin"], shopId)) {
    throw new ReactionError("access-denied", "Access denied");
  }

  return Object.keys(paymentMethodList)
    .map((name) => ({
      ...paymentMethodList[name],
      isEnabled: availablePaymentMethods.includes(name)
    }));
}
