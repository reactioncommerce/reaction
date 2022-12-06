import _ from "lodash";
import hashToken from "@reactioncommerce/api-utils/hashToken.js";
import ReactionError from "@reactioncommerce/reaction-error";

/**
 * @name acknowledgeCartMessage
 * @method
 * @summary Query the Cart collection for a cart with the provided accountId and shopId
 * @param {Object} context -  an object containing the per-request state
 * @param {Object} params - request parameters
 * @param {String} [params.accountId] - An account ID
 * @param {String} [params.shopId] - A shop ID
 * @param {String} [params.messageId] - A cart message ID
 * @returns {Promise<Object>|undefined} A Cart document, if one is found
 */
export default async function acknowledgeCartMessage(context, { cartId, messageId, cartToken } = {}) {
  const { collections, accountId } = context;
  const { Cart } = collections;

  let selector;
  if (accountId) {
    // Account cart
    selector = { _id: cartId, accountId };
  } else {
    // Anonymous cart
    if (!cartToken) {
      throw new ReactionError("not-found", "Cart not found");
    }

    selector = { _id: cartId, anonymousAccessToken: hashToken(cartToken) };
  }

  const cart = await Cart.findOne(selector);
  if (!cart) {
    throw new ReactionError("not-found", "Cart not found");
  }

  const cartMessages = cart.messages || [];
  const message = _.find(cartMessages, { _id: messageId });
  if (!message) {
    throw new ReactionError("not-found", "Message not found");
  }

  if (!message.requiresReadAcknowledgement) {
    throw new ReactionError("invalid-param", "Message does not require acknowledgement");
  }

  message.acknowledged = true;

  const { result } = await Cart.updateOne({ _id: cart._id }, { $set: { messages: cartMessages } });
  if (result.n !== 1) {
    throw new ReactionError("server-error", "Unable to update cart");
  }

  return { cart };
}
