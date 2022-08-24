import ReactionError from "@reactioncommerce/reaction-error";
import { paymentMethods } from "../registration.js";

/**
 * @name availablePaymentMethods
 * @method
 * @memberof Payments/NoMeteorQueries
 * @summary get list of all available payment methods for a shop
 * @param {Object} context - an object containing the per-request state
 * @param {String} shopId - shop id for which to get payment methods
 * @returns {Array<Object>} Array of PaymentMethods
 */
export default async function availablePaymentMethods(context, shopId) {
  const shop = await context.queries.shopById(context, shopId);
  if (!shop) throw new ReactionError("not-found", "Shop not found");
  const availableMethods = shop.availablePaymentMethods || [];

  return availableMethods
    .reduce((all, name) => {
      if (paymentMethods[name]) {
        all.push({ ...paymentMethods[name], isEnabled: true });
      }
      return all;
    }, []);
}
