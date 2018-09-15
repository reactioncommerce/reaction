import ReactionError from "@reactioncommerce/reaction-error";

/**
 * @name discounts/codes/credit
 * @method
 * @memberof Discounts/Codes/Methods
 * @summary calculates a credit off cart for discount codes
 * @param {String} cartId cartId
 * @param {String} discountId discountId
 * @param {Object} collections Map of MongoDB collections
 * @return {Number} returns discount total
 */
export default async function getCreditOffDiscount(cartId, discountId, collections) {
  const { Discounts } = collections;

  const discountMethod = await Discounts.findOne({ _id: discountId });
  if (!discountMethod) throw new ReactionError("not-found", "Discount not found");

  return discountMethod.discount || 0;
}
