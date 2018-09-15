import SimpleSchema from "simpl-schema";
import ReactionError from "@reactioncommerce/reaction-error";
import { Cart as CartSchema } from "/imports/collections/schemas";
import getCartById from "../util/getCartById";

const inputSchema = new SimpleSchema({
  "cartId": String,
  "items": {
    type: Array,
    minCount: 1
  },
  "items.$": Object,
  "items.$.cartItemId": String,
  "items.$.quantity": {
    type: SimpleSchema.Integer,
    min: 0
  },
  "token": {
    type: String,
    optional: true
  }
});

/**
 * @method updateCartItemsQuantity
 * @summary Sets a new quantity for one or more items in a cart
 * @param {Object} context -  an object containing the per-request state
 * @param {Object} input - Necessary input
 * @param {String} input.cartId - The ID of the cart in which all of the items exist
 * @param {String} input.items - Array of items to update
 * @param {Number} input.items.cartItemId - The cart item ID
 * @param {Object} input.items.quantity - The new quantity, which must be an integer of 0 or greater
 * @param {String} input.token - The token if the cart is an anonymous cart
 * @return {Promise<Object>} An object containing the updated cart in a `cart` property
 */
export default async function updateCartItemsQuantity(context, input) {
  inputSchema.validate(input || {});

  const { cartId, items, token: cartToken } = input;

  const cart = await getCartById(context, cartId, { cartToken, throwIfNotFound: true });

  let updatedItems = cart.items.map((item) => {
    const update = items.find(({ cartItemId }) => cartItemId === item._id);
    if (!update) return item;

    if (update.quantity === 0) {
      return null;
    }

    return {
      ...item,
      quantity: update.quantity
    };
  });

  // Remove the nulls
  updatedItems = updatedItems.filter((item) => !!item);

  const { appEvents, collections } = context;
  const { Cart } = collections;

  const updatedAt = new Date();
  const modifier = {
    $set: {
      items: updatedItems,
      updatedAt
    }
  };
  CartSchema.validate(modifier, { modifier: true });

  const { matchedCount } = await Cart.updateOne({ _id: cartId }, modifier);
  if (matchedCount === 0) throw new ReactionError("server-error", "Failed to update cart");

  const updatedCart = { ...cart, items: updatedItems, updatedAt };

  await appEvents.emit("afterCartUpdate", updatedCart);

  return { cart: updatedCart };
}
