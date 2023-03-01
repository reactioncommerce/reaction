import SimpleSchema from "simpl-schema";
import ReactionError from "@reactioncommerce/reaction-error";
import Logger from "@reactioncommerce/logger";
import hashToken from "@reactioncommerce/api-utils/hashToken.js";
import _ from "lodash";

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

  const { collections: { Cart, Promotions, Accounts, Coupons, CouponLogs }, userId } = context;
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
      Logger.error(`Cart not found for user with ID ${account._id}`);
      throw new ReactionError("invalid-params", "Cart not found");
    }

    selector.accountId = account._id;
  }

  const cart = await Cart.findOne(selector);
  if (!cart) {
    Logger.error(`Cart not found for user with ID ${userId}`);
    throw new ReactionError("invalid-params", "Cart not found");
  }

  const now = new Date();
  const coupons = await Coupons.find({
    code: couponCode,
    $or: [
      { expirationDate: { $gte: now } },
      { expirationDate: null }
    ],
    isArchived: { $ne: true }
  }).toArray();
  if (coupons.length > 1) {
    throw new ReactionError("invalid-params", "The coupon have duplicate with other promotion. Please contact admin for more information");
  }

  if (coupons.length === 0) {
    Logger.error(`The coupon code ${couponCode} is not found`);
    throw new ReactionError("invalid-params", `The coupon ${couponCode} is not found`);
  }

  const coupon = coupons[0];

  if (coupon.maxUsageTimes && coupon.maxUsageTimes > 0 && coupon.usedCount >= coupon.maxUsageTimes) {
    Logger.error(`The coupon code ${couponCode} is expired`);
    throw new ReactionError("invalid-params", "The coupon is expired");
  }

  if (coupon.maxUsageTimesPerUser && coupon.maxUsageTimesPerUser > 0) {
    if (!userId) throw new ReactionError("invalid-params", "You must be logged in to apply this coupon");

    const couponLog = await CouponLogs.findOne({ couponId: coupon._id, accountId: cart.accountId });
    if (couponLog && couponLog.usedCount >= coupon.maxUsageTimesPerUser) {
      Logger.error(`The coupon code ${couponCode} has expired`);
      throw new ReactionError("invalid-params", "The coupon is expired");
    }
  }

  const promotion = await Promotions.findOne({
    "_id": coupon.promotionId,
    shopId,
    "enabled": true,
    "triggers.triggerKey": "coupons"
  });

  if (!promotion) {
    Logger.error(`The promotion not found with coupon code ${couponCode}`);
    throw new ReactionError("invalid-params", "The coupon is not available");
  }

  if (_.find(cart.appliedPromotions, { _id: promotion._id })) {
    Logger.error(`The coupon code ${couponCode} is already applied`);
    throw new ReactionError("invalid-params", "The coupon already applied on the cart");
  }

  const promotionWithCoupon = {
    ...promotion,
    relatedCoupon: {
      couponCode,
      couponId: coupon._id
    }
  };

  return context.mutations.applyExplicitPromotionToCart(context, cart, promotionWithCoupon);
}
