import SimpleSchema from "simpl-schema";
import ReactionError from "@reactioncommerce/reaction-error";
import getCart from "../util/getCart.js";

const inputSchema = new SimpleSchema({
  cartId: String,
  discountCodeId: String,
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
 * @param {Object} input.discountCodeId - Discount code to remove from cart
 * @param {String} input.shopId - Shop cart belongs to
 * @param {String} [input.token] - Cart token, if anonymous
 * @returns {Promise<Object>} An object with the updated cart with the removed discount
 */
export default async function removeDiscountCodeFromCart(context, input) {
  inputSchema.validate(input);

  const { cartId, discountCodeId, shopId, token } = input;
  const { collections, userHasPermission } = context;
  const { Cart } = collections;

  // TODO: figure out the correct permission check here
  // Should it be `discounts`, or `cart`?
  // How do we determine this check if the user is the cart owner?
  if (!userHasPermission(["admin", "owner", "discounts"], shopId)) {
    throw new ReactionError("access-denied", "Access Denied");
  }

  let cart = await getCart(context, shopId, cartId, { cartToken: token, throwIfNotFound: false });

  // If we didn't find a cart, it means it belongs to another user,
  // not the currently logged in user.
  // Check to make sure current user has admin permission.
  if (!cart) {
    cart = await Cart.findOne({ _id: cartId });
    if (!cart) {
      throw new ReactionError("not-found", "Cart not found");
    }

    // TODO: figure out the correct permission check here
    // Should it be `discounts`, or `cart`?
    if (!userHasPermission(["owner", "admin", "discounts"], shopId)) {
      throw new ReactionError("access-denied", "Access Denied");
    }
  }

  // Instead of directly updating cart, we remove the discount billing
  // object from the existing cart, then pass to `saveCart`
  // to re-run cart through all transforms and validations.
  const updatedCartBilling = cart.billing.filter((doc) => doc._id !== discountCodeId);
  cart.billing = updatedCartBilling;

  const savedCart = await context.mutations.saveCart(context, cart);

  return savedCart;
}
