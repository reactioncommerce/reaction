import { check } from "meteor/check";
import * as Collections from "/lib/collections";
import getCart from "/imports/plugins/core/cart/both/util/getCart";

/**
 * @method cart/resetShipmentMethod
 * @memberof Cart/Methods
 * @summary Removes `shipmentMethod` object from cart
 * @param {String} cartId - cart _id
 * @return {Number} update result
 */
export default function resetShipmentMethod(cartId) {
  check(cartId, String);

  getCart(cartId, { throwIfNotFound: true });

  return Collections.Cart.update({ _id: cartId }, {
    $unset: { "shipping.0.shipmentMethod": "" }
  });
}
