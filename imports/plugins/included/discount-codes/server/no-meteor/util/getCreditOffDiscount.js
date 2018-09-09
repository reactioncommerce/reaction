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
  let discount = 0;
  const discountMethod = Discounts.findOne(discountId);
  ({ discount } = discountMethod);
  return discount;
}
