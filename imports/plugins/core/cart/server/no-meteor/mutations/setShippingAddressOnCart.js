import SimpleSchema from "simpl-schema";
import Random from "@reactioncommerce/random";
import ReactionError from "@reactioncommerce/reaction-error";
import { Address as AddressSchema } from "/imports/collections/schemas";
import getCartById from "../util/getCartById";

const inputSchema = new SimpleSchema({
  address: AddressSchema,
  addressId: {
    type: String,
    optional: true
  },
  cartId: String,
  cartToken: {
    type: String,
    optional: true
  }
});

/**
 * @method setShippingAddressOnCart
 * @summary Sets the shippingAddress data for all fulfillment groups on a cart that have
 *   a type of "shipping"
 * @param {Object} context - an object containing the per-request state
 * @param {Object} input - Input (see SimpleSchema)
 * @return {Promise<Object>} An object with a `cart` property containing the updated cart
 */
export default async function setShippingAddressOnCart(context, input) {
  const cleanedInput = inputSchema.clean(input); // add default values and such
  inputSchema.validate(cleanedInput);

  const { address, addressId, cartId, cartToken } = cleanedInput;
  address._id = addressId || Random.id();

  const cart = await getCartById(context, cartId, { cartToken, throwIfNotFound: true });

  let didModify = false;
  const updatedFulfillmentGroups = (cart.shipping || []).map((group) => {
    if (group.type === "shipping") {
      didModify = true;
      return { ...group, address };
    }
    return group;
  });

  if (!didModify) return { cart };

  const { appEvents, collections } = context;
  const { Cart } = collections;

  const updatedAt = new Date();
  const { matchedCount } = await Cart.updateOne({ _id: cartId }, {
    $set: {
      shipping: updatedFulfillmentGroups,
      updatedAt
    }
  });
  if (matchedCount === 0) throw new ReactionError("server-error", "Failed to update cart");

  const updatedCart = { ...cart, shipping: updatedFulfillmentGroups, updatedAt };

  await appEvents.emit("afterCartUpdate", cart._id, updatedCart);

  return { cart: updatedCart };
}
