import SimpleSchema from "simpl-schema";
import ReactionError from "@reactioncommerce/reaction-error";
import _ from "lodash";
import isPromotionExpired from "../utils/isPromotionExpired.js";

const inputSchema = new SimpleSchema({
  cartId: String,
  couponCode: String
});

/**
 * @method applyExplicitPromotion
 * @summary Apply a coupon code to a cart
 * @param {Object} context - The application context
 * @param {Object} input - The input
 * @param {String} input.cartId - The cart id
 * @param {Array<String>} input.promotion - The promotion to apply
 * @returns {Promise<Object>} with cart
 */
export default async function applyCouponToCart(context, input) {
  inputSchema.validate(input);

  const { collections: { Cart, Promotions } } = context;
  const { cartId, couponCode } = input;

  const cart = await Cart.findOne({ _id: cartId });
  if (!cart) {
    throw new ReactionError("not-found", "Cart not found");
  }

  const now = new Date();
  const promotion = await Promotions.findOne({
    "enabled": true,
    "type": "explicit",
    "startDate": { $lte: now },
    "triggers.triggerKey": "coupons",
    "triggers.triggerParameters.couponCode": couponCode
  });

  if (!promotion) {
    throw new ReactionError("not-found", "The coupon is not available");
  }

  if (isPromotionExpired(promotion)) {
    throw new ReactionError("coupon-expired", "The coupon is expired");
  }

  if (_.find(cart.appliedPromotions, { _id: promotion._id })) {
    throw new Error("coupon-already-exists", "The coupon already applied on the cart");
  }

  return context.mutations.applyExplicitPromotionToCart(context, cart, promotion);
}
