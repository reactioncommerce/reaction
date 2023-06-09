import _ from "lodash";
import ReactionError from "@reactioncommerce/reaction-error";

/**
 * @method validateInitialOrderData
 * @summary Performs the initial validation on the OrderData
 * @param {Object} context - an object containing the per-request state
 * @param {Object} cleanedInput - Necessary input. See SimpleSchema
 * @returns {Promise<Object>} Object with `order` property containing the created order
 */
export default async function validateInitialOrderData(context, cleanedInput) {
  const { order: orderInput } = cleanedInput;
  const { cartId, shopId } = orderInput;
  const { userId } = context;

  if (!shopId) throw new ReactionError("invalid-param", "ShopID not found in order data", { field: "ShopId", value: shopId });

  const shop = await context.queries.shopById(context, shopId);
  if (!shop) throw new ReactionError("not-found", "Shop not found while trying to validate order data", { field: "ShopId", value: shopId });

  let cart;
  if (cartId) {
    cart = await context.queries.getCartById(context, cartId);
    if (!cart) {
      throw new ReactionError("not-found", "Cart not found while trying to validate order data", { field: "CartId", value: cartId });
    }

    const allCartMessageAreAcknowledged = _.every((cart.messages || []), (message) => !message.requiresReadAcknowledgement || message.acknowledged);
    if (!allCartMessageAreAcknowledged) {
      throw new ReactionError("invalid-cart", "Cart messages should be acknowledged before placing order");
    }

    await context.mutations.transformAndValidateCart(context, cart, { skipTemporaryPromotions: true });
  }

  if (!userId && !shop.allowGuestCheckout) {
    throw new ReactionError("access-denied", "Guest checkout not allowed");
  }

  return { shop, cart };
}
