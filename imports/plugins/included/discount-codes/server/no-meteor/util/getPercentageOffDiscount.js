/**
 * @name discounts/codes/discount
 * @method
 * @memberof Discounts/Codes/Methods
 * @summary calculates percentage off discount rates
 * @param {String} cartId cartId
 * @param {String} discountId discountId
 * @param {Object} collections Map of MongoDB collections
 * @return {Number} returns discount total
 */
export default async function getPercentageOffDiscount(cartId, discountId, collections) {
  const { Cart, Discounts } = collections;
  let discount = 0;
  const discountMethod = Discounts.findOne(discountId);
  const cart = Cart.findOne({ _id: cartId });

  for (const item of cart.items) {
    const preDiscount = item.quantity * item.priceWhenAdded.amount;
    discount += preDiscount * discountMethod.discount / 100;
  }

  return discount;
}
