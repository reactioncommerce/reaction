import ReactionError from "@reactioncommerce/reaction-error";

/**
 * @summary Calculates total surcharge amount for a cart based on all surcharges
 *   that have been applied to it
 * @param {Object} context Context object
 * @param {String} cartId Cart ID
 * @returns {Object} Object with `surcharges` array and `total`
 */
export default async function getSurchargesTotalForCart(context, cartId) {
  const { collections } = context;
  const { Cart } = collections;

  const cart = await Cart.findOne({ _id: cartId });
  if (!cart) {
    throw new ReactionError("not-found", "Cart not found");
  }

  const { surcharges } = cart;

  // Surcharges are additive, if we allow more than one
  return {
    surcharges,
    total: surcharges.reduce((sum, surcharge) => sum + surcharge.amount.amount, 0)
  };
}
