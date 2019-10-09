import SimpleSchema from "simpl-schema";
import hashToken from "@reactioncommerce/api-utils/hashToken.js";
import ReactionError from "@reactioncommerce/reaction-error";

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
 * @returns {Promise<Object>} An object with `cart` property containing the updated cart
 */
export default async function setEmailOnAnonymousCart(context, input) {
  inputSchema.validate(input || {});

  const { collections: { Cart } } = context;
  const { cartId, email, token } = input;

  const cart = await Cart.findOne({
    _id: cartId,
    anonymousAccessToken: hashToken(token)
  });
  if (!cart) throw new ReactionError("not-found", "Cart not found");

  const updatedCart = {
    ...cart,
    email,
    updatedAt: new Date()
  };

  const savedCart = await context.mutations.saveCart(context, updatedCart);

  return { cart: savedCart };
}
