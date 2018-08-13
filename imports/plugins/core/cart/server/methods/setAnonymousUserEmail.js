import { check } from "meteor/check";
import { Cart } from "/lib/collections";
import { hashLoginToken } from "/imports/core-server";
import appEvents from "/imports/plugins/core/core/server/appEvents";

/**
 * @method cart/setAnonymousUserEmail
 * @memberof Cart/Methods
 * @summary Assigns email to anonymous user's cart instance
 * @param {String} cartId - The cart ID
 * @param {String} anonymousAccessToken - Token for accessing this cart
 * @param {String} email - email to set for anonymous user's cart instance
 * @return {Number} returns update result
 */
export default function setAnonymousUserEmail(cartId, anonymousAccessToken, email) {
  check(cartId, String);
  check(anonymousAccessToken, String);
  check(email, String);

  const result = Cart.update({
    _id: cartId,
    anonymousAccessToken: hashLoginToken(anonymousAccessToken)
  }, {
    $set: { email }
  });

  const updatedCart = Cart.findOne({
    _id: cartId,
    anonymousAccessToken: hashLoginToken(anonymousAccessToken)
  });

  Promise.await(appEvents.emit("afterCartUpdate", updatedCart._id, updatedCart));

  return result;
}
