import SimpleSchema from "simpl-schema";
import ReactionError from "@reactioncommerce/reaction-error";
import getCart from "../util/getCart.js";

const inputSchema = new SimpleSchema({
  cartId: String,
  discountId: String,
  shopId: String,
  token: {
    type: String,
    optional: true
  }
});

/**
 * @method removeDiscountCodeFromCart
 * @summary Applies a discount code to a cart
 * @param {Object} context - an object containing the per-request state
 * @param {Object} input - an object of all mutation arguments that were sent by the client
 * @param {Object} input.cartId - Cart to remove discount from
 * @param {Object} input.discountId - Discount code to remove from cart
 * @param {String} input.shopId - Shop cart belongs to
 * @param {String} [input.token] - Cart token, if anonymous
 * @returns {Promise<Object>} An object with the updated cart with the removed discount
 */
export default async function removeDiscountCodeFromCart(context, input) {
  inputSchema.validate(input);

  const { cartId, discountId, shopId, token } = input;
  const { collections, userHasPermission } = context;
  const { Cart } = collections;

  let cart = await getCart(context, shopId, cartId, { cartToken: token, throwIfNotFound: false });

  // If we didn't find a cart, it means it belongs to another user,
  // not the currently logged in user.
  // Check to make sure current user has admin permission.
  if (!cart) {
    if (!userHasPermission(["owner", "admin", "discounts/apply"], shopId)) {
      throw new ReactionError("access-denied", "Access Denied");
    }

    cart = await Cart.findOne({ _id: cartId, shopId });
    if (!cart) {
      throw new ReactionError("not-found", "Cart not found");
    }
  }

  // Instead of directly updating cart, we remove the discount billing
  // object from the existing cart, then pass to `saveCart`
  // to re-run cart through all transforms and validations.
  const updatedCartBilling = cart.billing.filter((doc) => doc._id !== discountId);
  if (cart.billing.length === updatedCartBilling.length) {
    throw new ReactionError("not-found", "No applied discount found with that ID");
  }
  cart.billing = updatedCartBilling;

  const savedCart = await context.mutations.saveCart(context, cart);

  return savedCart;
}
