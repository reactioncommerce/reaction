import SimpleSchema from "simpl-schema";
import ReactionError from "@reactioncommerce/reaction-error";
import applyExplicitCoupons from "../handlers/applyExplicitPromotions.js";

const inputSchema = new SimpleSchema({
  "cartId": String,
  "promotionIds": Array,
  "promotionIds.$": {
    type: String
  }
});

/**
 * @method applyExplicitPromotions
 * @summary Apply a coupon code to a cart
 * @param {Object} context
 * @param {Object} input
 * @param {String} input.cartId - Cart ID
 * @param {Array<String>} input.promotionIds - Array of promotion IDs to apply to the cart
 * @returns {Promise<Object>} with cart
 */
export default async function applyExplicitPromotions(context, input) {
  inputSchema.validate(input);

  const {
    collections: { Cart, Promotions }
  } = context;
  const { cartId, promotionIds } = input;

  const cart = await Cart.findOne({ _id: cartId });
  if (!cart) {
    throw new ReactionError("not-found", "Cart not found");
  }

  const now = new Date();
  const promotions = await Promotions.find({
    _id: { $in: promotionIds },
    enabled: true,
    type: "explicit",
    startDate: { $lte: now }
  }).toArray();

  if (promotions.length !== promotionIds.length) {
    throw new ReactionError("not-found", "Some promotions are not available");
  }

  return applyExplicitCoupons(context, cart, promotions);
}
