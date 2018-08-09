import { check, Match } from "meteor/check";
import * as Collections from "/lib/collections";
import getCart from "/imports/plugins/core/cart/server/util/getCart";

/**
 * @method cart/resetShipmentMethod
 * @memberof Cart/Methods
 * @summary Removes `shipmentMethod` object from cart
 * @param {String} cartId - cart _id
 * @param {String} [cartToken] - Token for cart, if it's anonymous
 * @return {Number} update result
 */
export default function resetShipmentMethod(cartId, cartToken) {
  check(cartId, String);
  check(cartToken, Match.Maybe(String));

  getCart(cartId, { cartToken, throwIfNotFound: true });

  return Collections.Cart.update({ _id: cartId }, {
    $unset: { "shipping.0.shipmentMethod": "" }
  });
}
