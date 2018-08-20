import { check, Match } from "meteor/check";
import { Cart } from "/lib/collections";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import getCart from "/imports/plugins/core/cart/server/util/getCart";
import appEvents from "/imports/plugins/core/core/server/appEvents";

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

  const { cart } = getCart(cartId, { cartToken, throwIfNotFound: true });

  let selector;
  let update;
  // temp hack until we build out multiple billing handlers
  // if we have an existing item update it, otherwise add to set.
  if (Array.isArray(cart.billing) && cart.billing.length > 0) {
    selector = {
      "_id": cartId,
      "billing._id": cart.billing[0]._id
    };
    update = {
      $set: {
        "billing.$.address": address
      }
    };
  } else {
    selector = {
      _id: cartId
    };
    update = {
      $addToSet: {
        billing: {
          address
        }
      }
    };
  }

  const result = Cart.update(selector, update);

  const updatedCart = Cart.findOne({ _id: cartId });

  Promise.await(appEvents.emit("afterCartUpdate", updatedCart._id, updatedCart));

  return result;
}
