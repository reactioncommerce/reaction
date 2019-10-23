import ReactionError from "@reactioncommerce/reaction-error";
import { paymentMethods as allPaymentMethods } from "../registration.js";

/**
 * @name paymentMethods
 * @method
 * @memberof Payments/NoMeteorQueries
 * @summary get list of all registered payment methods for a shop
 * @param {Object} context - an object containing the per-request state
 * @param {String} shopId - shop id for which to get payment methods
 * @returns {Array<Object>} Array of PaymentMethods
 */
export default async function paymentMethods(context, shopId) {
  const shop = await context.queries.shopById(context, shopId);
  if (!shop) throw new ReactionError("not-found", "Shop not found");
  const availablePaymentMethods = shop.availablePaymentMethods || [];

  if (!context.userHasPermission(["owner", "admin"], shopId)) {
    throw new ReactionError("access-denied", "Access denied");
  }

  return Object.keys(allPaymentMethods)
    .map((name) => ({
      ...allPaymentMethods[name],
      // Force canRefund to be set
      canRefund: allPaymentMethods[name].canRefund !== false,
      isEnabled: availablePaymentMethods.includes(name)
    }));
}
