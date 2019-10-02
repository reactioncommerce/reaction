import { decodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";

/**
 * @name Query.paymentMethods
 * @method
 * @memberof Payment/GraphQL
 * @summary get all available payment methods for a given shop
 * @param {Object} _ - unused
 * @param {Object} args - an object of all arguments that were sent by the client
 * @param {String} args.shopId - shop id for which to get payment methods
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Array<Object>>} Array of PaymentMethods
 */
export default async function paymentMethods(_, { shopId }, context) {
  const dbShopId = decodeShopOpaqueId(shopId);
  return context.queries.paymentMethods(context, dbShopId);
}
