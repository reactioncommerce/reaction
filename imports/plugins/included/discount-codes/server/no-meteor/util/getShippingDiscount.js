/**
 * @name discounts/codes/shipping
 * @method
 * @memberof Discounts/Codes/Methods
 * @summary calculates a discount based on the value of a calculated shipping rate in the cart.
 * @param {String} cartId cartId
 * @param {String} discountId discountId
 * @param {Object} collections Map of MongoDB collections
 * @return {Number} returns discount total
 */
export default async function getShippingDiscount(cartId, discountId, collections) {
  const { Cart, Discounts } = collections;
  let discount = 0;
  const discountMethod = Discounts.findOne(discountId);
  const cart = Cart.findOne({ _id: cartId });
  if (cart.shipping && cart.shipping.length) {
    for (const shipping of cart.shipping) {
      if (shipping.shipmentMethod && shipping.shipmentMethod.name.toUpperCase() === discountMethod.discount.toUpperCase()) {
        discount += Math.max(0, shipping.shipmentMethod.rate);
      }
    }
  }
  return discount;
}
