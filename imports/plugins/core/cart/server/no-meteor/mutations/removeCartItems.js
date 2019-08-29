import SimpleSchema from "simpl-schema";
import ReactionError from "@reactioncommerce/reaction-error";
import hashLoginToken from "/imports/node-app/core/util/hashLoginToken";

const inputSchema = new SimpleSchema({
  "cartId": String,
  "cartItemIds": {
    type: Array,
    minCount: 1
  },
  "cartItemIds.$": String,
  "token": {
    type: String,
    optional: true
  }
});

/**
 * @method removeCartItems
 * @summary Removes one or more items from a cart
 * @param {Object} context -  an object containing the per-request state
 * @param {Object} input - Necessary input
 * @param {String} input.cartId - The ID of the cart in which all of the items exist
 * @param {String[]} input.cartItemIds - Array of cart item IDs to remove
 * @param {String} input.token - The token if the cart is an anonymous cart
 * @returns {Promise<Object>} An object containing the updated cart in a `cart` property
 */
export default async function removeCartItems(context, input) {
  inputSchema.validate(input || {});

  const { accountId, collections } = context;
  const { Cart } = collections;
  const { cartId, cartItemIds, token } = input;

  const selector = { _id: cartId };
  if (token) {
    selector.anonymousAccessToken = hashLoginToken(token);
  } else if (accountId) {
    selector.accountId = accountId;
  } else {
    throw new ReactionError("invalid-param", "A token is required when updating an anonymous cart");
  }

  const cart = await Cart.findOne(selector);
  if (!cart) throw new ReactionError("not-found", "Cart not found");

  const updatedCart = {
    ...cart,
    items: cart.items.filter((item) => !cartItemIds.includes(item._id)),
    updatedAt: new Date()
  };

  const savedCart = await context.mutations.saveCart(context, updatedCart);

  return { cart: savedCart };
}
