import { withFilter } from "graphql-subscriptions";
import ReactionError from "@reactioncommerce/reaction-error";
import hashToken from "@reactioncommerce/api-utils/hashToken.js";

/**
 * @summary Filters the subscription result
 * @param {Object} payload - The subscription payload
 * @param {Object} variables - The subscription variables
 * @returns {Boolean} - Whether the subscription result should be sent to the client
 */
export function filter(payload, variables) {
  const { cartUpdated: cart } = payload;
  const { input: { cartId, accountId, cartToken } } = variables;

  if (!cart) return false;
  if (cart._id !== cartId) return false;
  if (accountId) return cart.accountId === accountId;
  return cart.anonymousAccessToken === hashToken(cartToken);
}

/**
 * @summary Publishes the updated cart to the client
 * @param {Object} _ unused
 * @param {Object} args - The arguments passed to the subscription
 * @param {Object} context - The application context
 * @returns {Promise<Object>} the filtered subscription result
 */
async function cartUpdated(_, args, context) {
  const { input: { cartId, accountId, cartToken } } = args;
  const { collections: { Cart, Accounts }, userId } = context;

  const selector = { _id: cartId };
  if (accountId) {
    const account = await Accounts.findOne({ _id: accountId, userId });
    if (!account) throw new ReactionError("invalid-params", "Account id does not match user id");
    selector.accountId = accountId;
  } else {
    selector.anonymousAccessToken = hashToken(cartToken);
  }

  const cart = await Cart.findOne(selector);
  if (!cart) throw new ReactionError("not-found", "Cart not found");

  return withFilter(() => context.pubSub.asyncIterator(["CART_UPDATED"]), filter)(_, args, context);
}

export default {
  subscribe: cartUpdated
};
