import Logger from "@reactioncommerce/logger";
import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import * as Collections from "/lib/collections";

/**
 * @method cart/resetShipmentMethod
 * @memberof Cart/Methods
 * @summary Removes `shipmentMethod` object from cart
 * @param {String} cartId - cart _id
 * @return {Number} update result
 */
export default function resetShipmentMethod(cartId) {
  check(cartId, String);

  const cart = Collections.Cart.findOne({
    _id: cartId,
    userId: this.userId
  });
  if (!cart) {
    Logger.error(`Cart not found for user: ${this.userId}`);
    throw new Meteor.Error(
      "not-found",
      `Cart: ${cartId} not found for user: ${this.userId}`
    );
  }

  return Collections.Cart.update({ _id: cartId }, {
    $unset: { "shipping.0.shipmentMethod": "" }
  });
}
