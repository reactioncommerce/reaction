/* eslint-disable no-unused-vars */
import ReactionError from "@reactioncommerce/reaction-error";

/**
 * @summary Add the discount to the shipping record
 * @param {Object} context - The application context
 * @param {Object} params - The parameters to apply
 * @param {Object} cart - The cart to apply the discount to
 * @returns {Promise<void>} undefined
 */
export default async function applyShippingDiscountToCart(context, params, cart) {
  throw new ReactionError("not-implemented", "Not implemented");
}
