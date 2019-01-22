import SimpleSchema from "simpl-schema";
import ReactionError from "@reactioncommerce/reaction-error";
import hashLoginToken from "/imports/node-app/core/util/hashLoginToken";

const inputSchema = new SimpleSchema({
  cartId: String,
  token: String,
  email: {
    type: String,
    regEx: SimpleSchema.RegEx.Email
  }
});

/**
 * @method setEmailOnAnonymousCart
 * @summary Assigns email to anonymous user's cart instance
 * @param {Object} context -  an object containing the per-request state
 * @param {Object} input - an object of all mutation arguments that were sent by the client
 * @param {String} input.cartId - An anonymous cart ID
 * @param {String} input.token - The token for accessing the anonymous cart
 * @param {String} input.email - The email address to associate with this cart
 * @return {Promise<Object>} An object with `cart` property containing the updated cart
 */
export default async function setEmailOnAnonymousCart(context, input) {
  inputSchema.validate(input || {});

  const { appEvents, collections, userId } = context;
  const { Cart } = collections;
  const { cartId, email, token } = input;

  const { matchedCount } = await Cart.updateOne({
    _id: cartId,
    anonymousAccessToken: hashLoginToken(token)
  }, {
    $set: { email }
  });
  if (matchedCount === 0) throw new ReactionError("server-error", "Unable to update cart");

  const updatedCart = await Cart.findOne({ _id: cartId });

  await appEvents.emit("afterCartUpdate", {
    cart: updatedCart,
    updatedBy: userId
  });

  return {
    cart: updatedCart
  };
}
