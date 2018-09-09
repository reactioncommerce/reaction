/**
 * @name discounts/codes/sale
 * @method
 * @memberof Discounts/Codes/Methods
 * @summary calculates a new price for an item
 * @param  {String} cartId cartId
 * @param  {String} discountId discountId
 * @param {Object} collections Map of MongoDB collections
 * @return {Number} returns discount total
 */
export default async function getItemPriceDiscount(cartId, discountId, collections) {
  const { Cart, Discounts } = collections;
  let discount = 0;
  const discountMethod = Discounts.findOne(discountId);
  const cart = Cart.findOne({ _id: cartId });

  // TODO add item specific conditions to sale calculations.
  for (const item of cart.items) {
    const preDiscountItemTotal = item.quantity * item.priceWhenAdded.amount;
    const salePriceItemTotal = item.quantity * discountMethod.discount;
    // we if the sale is below 0, we won't discount at all. that's invalid.
    discount += Math.max(0, preDiscountItemTotal - salePriceItemTotal);
  }

  return discount;
}
