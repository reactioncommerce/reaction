import _ from "lodash";
import hashToken from "@reactioncommerce/api-utils/hashToken.js";
import ReactionError from "@reactioncommerce/reaction-error";

/**
 * @name acknowledgeCartMessage
 * @method
 * @summary Mutations to acknowledge a cart message
 * @param {Object} context -  an object containing the per-request state
 * @param {Object} params - request parameters
 * @param {String} [params.cartId] - The cart ID
 * @param {String} [params.messageId] - A cart message ID
 * @param {String} [params.cartToken] - The cart token, if the cart is anonymous
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
      throw new ReactionError("invalid-params", "Cart token not provided");
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

  const { value } = await Cart.findOneAndUpdate(
    { "_id": cart._id, "messages._id": messageId },
    { $set: { "messages.$.acknowledged": true } },
    { returnDocument: "after" }
  );

  if (!value) {
    throw new ReactionError("server-error", "Unable to update cart");
  }

  return { cart: value };
}
