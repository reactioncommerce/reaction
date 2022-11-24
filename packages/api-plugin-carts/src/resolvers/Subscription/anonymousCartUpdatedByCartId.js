import ReactionError from "@reactioncommerce/reaction-error";
import hashToken from "@reactioncommerce/api-utils/hashToken.js";
import { withFilter } from "graphql-subscriptions";

/**
 * @summary Filters the subscription result
 * @param {Object} payload - The subscription payload
 * @param {Object} variables - The subscription variables
 * @returns {Boolean} - Whether the subscription result should be sent to the client
 */
export function filter(payload, variables) {
  const { anonymousCartUpdatedByCartId: cart } = payload;
  if (!cart) return false;

  return cart._id === variables.cartId;
}

/**
 * @summary Publishes the updated cart to the client
 * @param {Object} _ unused
 * @param {Object} args - The arguments passed to the subscription
 * @param {Object} context - The application context
 * @returns {Promise<Object>} the filtered subscription result
 */
async function anonymousCartUpdatedByCartId(_, args, context) {
  const { cartId, cartToken } = args;
  const { collections: { Cart } } = context;

  if (!cartId) throw new ReactionError("invalid-params", "You must provide a cartId");
  if (!cartToken) throw new ReactionError("invalid-params", "You must provide a cartToken");

  const cart = await Cart.findOne({ _id: cartId, anonymousAccessToken: hashToken(cartToken) });
  if (!cart) throw new ReactionError("not-found", "Cart not found");

  return withFilter(() => context.pubSub.asyncIterator(["CART_UPDATED"]), filter)(_, args, context);
}

export default {
  subscribe: anonymousCartUpdatedByCartId
};
