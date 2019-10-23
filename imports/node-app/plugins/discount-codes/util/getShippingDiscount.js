import ReactionError from "@reactioncommerce/reaction-error";

/**
 * @name discounts/codes/shipping
 * @method
 * @memberof Discounts/Codes/Methods
 * @summary calculates a discount based on the value of a calculated shipping rate in the cart.
 * @param {String} cartId cartId
 * @param {String} discountId discountId
 * @param {Object} collections Map of MongoDB collections
 * @returns {Number} returns discount total
 */
export default async function getShippingDiscount(cartId, discountId, collections) {
  const { Cart, Discounts } = collections;

  const discountMethod = await Discounts.findOne({ _id: discountId });
  if (!discountMethod) throw new ReactionError("not-found", "Discount not found");

  // For "shipping" type discounts, the `discount` string is the name of the fulfillment method that should be discounted to be free.
  const fulfillmentMethodName = discountMethod.discount.toUpperCase();

  const cart = await Cart.findOne({ _id: cartId });
  if (!cart) throw new ReactionError("not-found", "Cart not found");

  let discount = 0;
  if (cart.shipping && cart.shipping.length) {
    for (const shipping of cart.shipping) {
      if (shipping.shipmentMethod && shipping.shipmentMethod.name.toUpperCase() === fulfillmentMethodName) {
        discount += Math.max(0, shipping.shipmentMethod.rate);
      }
    }
  }
  return discount;
}
