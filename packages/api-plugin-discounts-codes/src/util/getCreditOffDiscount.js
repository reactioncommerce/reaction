import ReactionError from "@reactioncommerce/reaction-error";

/**
 * @name discounts/codes/credit
 * @method
 * @memberof Discounts/Codes/Methods
 * @summary calculates a credit off cart for discount codes
 * @param {String} cartId cartId
 * @param {String} discountId discountId
 * @param {Object} collections Map of MongoDB collections
 * @returns {Number} returns discount total
 */
export default async function getCreditOffDiscount(cartId, discountId, collections) {
  const { Discounts } = collections;

  const discountMethod = await Discounts.findOne({ _id: discountId });
  if (!discountMethod) throw new ReactionError("not-found", "Discount not found");

  // For "credit" type discount, the `discount` string is expected to parse as a float
  const discountAmount = Number(discountMethod.discount);
  if (isNaN(discountAmount)) throw new ReactionError("invalid", `"${discountMethod.discount}" is not a number`);

  return discountAmount || 0;
}
