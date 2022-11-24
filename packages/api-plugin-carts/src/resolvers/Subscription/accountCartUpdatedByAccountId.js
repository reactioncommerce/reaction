import { withFilter } from "graphql-subscriptions";
import ReactionError from "@reactioncommerce/reaction-error";

/**
 * @summary Filters the subscription result
 * @param {Object} payload - The subscription payload
 * @param {Object} variables - The subscription variables
 * @returns {Boolean} - Whether the subscription result should be sent to the client
 */
export function filter(payload, variables) {
  const { accountCartUpdatedByAccountId: cart } = payload;
  if (!cart) return false;

  const { accountId, shopId } = variables;
  return cart.accountId === accountId && cart.shopId === shopId;
}

/**
 * @summary Publishes the updated cart to the client
 * @param {Object} _ unused
 * @param {Object} args - The arguments passed to the subscription
 * @param {Object} context - The application context
 * @returns {Promise<Object>} the filtered subscription result
 */
async function accountCartUpdatedByAccountId(_, args, context) {
  const { accountId, shopId } = args;
  const { collections: { Cart, Accounts }, userId } = context;

  if (!userId) throw new ReactionError("access-denied", "Access denied");

  if (!accountId) throw new ReactionError("invalid-params", "You must provide an accountId");

  const account = await Accounts.findOne({ _id: accountId, userId });
  if (!account) throw new ReactionError("invalid-params", "Account id does not match user id");

  const cart = await Cart.findOne({ accountId: account._id, shopId });
  if (!cart) throw new ReactionError("not-found", "Cart not found");

  return withFilter(() => context.pubSub.asyncIterator(["CART_UPDATED"]), filter)(_, args, context);
}

export default {
  subscribe: accountCartUpdatedByAccountId
};
