import SimpleSchema from "simpl-schema";
import ReactionError from "@reactioncommerce/reaction-error";
import hashLoginToken from "/imports/node-app/core/util/hashLoginToken";
import getCartById from "../util/getCartById";

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

  const { appEvents, collections, userId } = context;
  const { cartId, cartItemIds, token: cartToken } = input;

  const cart = await getCartById(context, cartId, { cartToken, throwIfNotFound: true });

  const updatedAt = new Date();

  const { Cart } = collections;
  const { modifiedCount } = await Cart.updateOne({ _id: cartId }, {
    $pull: {
      items: {
        _id: { $in: cartItemIds }
      }
    },
    $set: { updatedAt }
  });

  if (modifiedCount === 0) throw new ReactionError("not-found", "Cart not found or provided items are not in the cart");

  const updatedItems = cart.items.reduce((list, item) => {
    if (!cartItemIds.includes(item._id)) {
      return [...list, item];
    }
    return list;
  }, []);

  const updatedCart = { ...cart, items: updatedItems, updatedAt };

  await appEvents.emit("afterCartUpdate", {
    cart: updatedCart,
    updatedBy: userId
  });

  const updatedCartAfterAppEvents = await Cart.findOne({ _id: cartId });
  return { cart: updatedCartAfterAppEvents };
}
