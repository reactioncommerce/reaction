import { check, Match } from "meteor/check";
import { Cart } from "/lib/collections";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import getCart from "/imports/plugins/core/cart/server/util/getCart";
import appEvents from "/imports/node-app/core/util/appEvents";

/**
 * @method cart/setPaymentAddress
 * @memberof Cart/Methods
 * @summary Adds address book to cart payments
 * @param {String} cartId - cartId to apply payment address
 * @param {String} [cartToken] - Token for cart, if it's anonymous
 * @param {Object} address - addressBook object
 * @todo maybe we need to rename this method to `cart/setBillingAddress`?
 * @return {Number} return Mongo update result
 */
export default function setPaymentAddress(cartId, cartToken, address) {
  check(cartId, String);
  check(cartToken, Match.Maybe(String));
  Reaction.Schemas.Address.validate(address);

  getCart(cartId, { cartToken, throwIfNotFound: true });

  const result = Cart.update({
    _id: cartId
  }, {
    $set: {
      billingAddress: address
    }
  });

  const updatedCart = Cart.findOne({ _id: cartId });

  Promise.await(appEvents.emit("afterCartUpdate", {
    cart: updatedCart,
    updatedBy: Reaction.getUserId()
  }));

  return result;
}
