import { check } from "meteor/check";
import { Cart } from "/lib/collections";
import hashLoginToken from "/imports/plugins/core/accounts/server/no-meteor/util/hashLoginToken";

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

  return Cart.update({
    _id: cartId,
    anonymousAccessToken: hashLoginToken(anonymousAccessToken)
  }, {
    $set: { email }
  });
}
