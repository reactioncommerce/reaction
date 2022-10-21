import SimpleSchema from "simpl-schema";
import ReactionError from "@reactioncommerce/reaction-error";
import Logger from "@reactioncommerce/logger";
import hashToken from "@reactioncommerce/api-utils/hashToken.js";
import _ from "lodash";
import isPromotionExpired from "../utils/isPromotionExpired.js";

const inputSchema = new SimpleSchema({
  shopId: String,
  cartId: String,
  couponCode: String,
  cartToken: {
    type: String,
    optional: true
  }
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

  const { collections: { Cart, Promotions, Accounts }, userId } = context;
  const { shopId, cartId, couponCode, cartToken } = input;

  const selector = { shopId };

  if (cartId) {
    selector._id = cartId;
  }

  if (cartToken) {
    selector.anonymousAccessToken = hashToken(cartToken);
  } else {
    const account = (userId && (await Accounts.findOne({ userId }))) || null;

    if (!account) {
      Logger.error(`Cart not found for user with ID ${userId}`);
      throw new ReactionError("not-found", "Cart not found");
    }

    selector.accountId = account._id;
  }

  const cart = await Cart.findOne(selector);
  if (!cart) {
    Logger.error(`Cart not found for user with ID ${userId}`);
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
    Logger.error(`The promotion not found with coupon code ${couponCode}`);
    throw new ReactionError("not-found", "The coupon is not available");
  }

  if (isPromotionExpired(promotion)) {
    Logger.error(`The coupon code ${couponCode} is expired`);
    throw new ReactionError("coupon-expired", "The coupon is expired");
  }

  if (_.find(cart.appliedPromotions, { _id: promotion._id })) {
    Logger.error(`The coupon code ${couponCode} is already applied`);
    throw new Error("coupon-already-exists", "The coupon already applied on the cart");
  }

  return context.mutations.applyExplicitPromotionToCart(context, cart, promotion);
}
