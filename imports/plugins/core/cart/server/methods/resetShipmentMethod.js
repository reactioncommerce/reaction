import { check, Match } from "meteor/check";
import { Cart } from "/lib/collections";
import getCart from "/imports/plugins/core/cart/server/util/getCart";
import appEvents from "/imports/plugins/core/core/server/appEvents";

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

  const { cart } = getCart(cartId, { cartToken, throwIfNotFound: true });

  const result = Cart.update({ _id: cartId }, {
    $unset: { "shipping.0.shipmentMethod": "" }
  });

  delete cart.shipping[0].shipmentMethod;
  Promise.await(appEvents.emit("afterCartUpdate", cartId, cart));

  return result;
}
