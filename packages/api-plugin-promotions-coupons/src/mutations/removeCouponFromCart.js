import SimpleSchema from "simpl-schema";
import ReactionError from "@reactioncommerce/reaction-error";
import Logger from "@reactioncommerce/logger";
import hashToken from "@reactioncommerce/api-utils/hashToken.js";
import _ from "lodash";

const inputSchema = new SimpleSchema({
  shopId: String,
  cartId: String,
  promotionId: String,
  cartToken: {
    type: String,
    optional: true
  }
});

/**
 * @summary Remove a coupon from a cart
 * @param {Object} context - The application context
 * @param {Object} input - The input
 * @returns {Promise<Object>} - The updated cart
 */
export default async function removeCouponFromCart(context, input) {
  inputSchema.validate(input);

  const { collections: { Cart, Accounts }, userId } = context;
  const { shopId, cartId, promotionId, cartToken } = input;

  const selector = { shopId };

  if (cartId) selector._id = cartId;

  if (cartToken) {
    selector.anonymousAccessToken = hashToken(cartToken);
  } else {
    const account = (userId && (await Accounts.findOne({ userId }))) || null;

    if (!account) {
      Logger.error(`Cart not found for user with ID ${userId}`);
      throw new ReactionError("invalid-params", "Cart not found");
    }

    selector.accountId = account._id;
  }

  const cart = await Cart.findOne(selector);
  if (!cart) {
    Logger.error(`Cart not found for user with ID ${userId}`);
    throw new ReactionError("invalid-params", "Cart not found");
  }

  const newAppliedPromotions = _.filter(cart.appliedPromotions, (appliedPromotion) => appliedPromotion._id !== promotionId);
  if (newAppliedPromotions.length === cart.appliedPromotions.length) {
    Logger.error(`Promotion ${promotionId} not found on cart ${cartId}`);
    throw new ReactionError("invalid-params", "Can't remove coupon because it's not on the cart");
  }

  cart.appliedPromotions = newAppliedPromotions;

  const updatedCart = await context.mutations.saveCart(context, cart);
  return updatedCart;
}
