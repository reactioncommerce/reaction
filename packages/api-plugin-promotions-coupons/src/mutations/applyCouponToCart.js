import SimpleSchema from "simpl-schema";
import ReactionError from "@reactioncommerce/reaction-error";

const inputSchema = new SimpleSchema({
  "cartId": String,
  "promotionIds": Array,
  "promotionIds.$": {
    type: String
  }
});

/**
 * @method applyCouponToCart
 * @summary Apply a coupon code to a cart
 * @param {Object} context
 * @param {Object} input
 * @param {String} input.cartId - Cart ID
 * @param {Array<String>} input.promotionIds - Array of promotion IDs to apply to the cart
 * @returns {Promise<Object>} with cart
 */
export default async function applyCouponToCart(context, input) {
  inputSchema.validate(input);

  const now = new Date();
  const {
    appEvents,
    collections: { Cart, Promotions }
  } = context;
  const { cartId, promotionIds } = input;

  const cart = await Cart.findOne({ _id: cartId });
  if (!cart) {
    throw new ReactionError("not-found", "Cart not found");
  }

  const promotions = await Promotions.find({
    _id: { $in: promotionIds },
    type: "explicit",
    startDate: { $lte: now },
    triggers: {
      $elemMatch: {
        triggerKey: "coupons"
      }
    }
  }).toArray();

  if (promotions.length !== promotionIds.length) {
    throw new ReactionError("not-found", "Some promotions are not available");
  }

  appEvents.emit("applyCouponToCart", {
    cart,
    promotions
  });

  return cart;
}
