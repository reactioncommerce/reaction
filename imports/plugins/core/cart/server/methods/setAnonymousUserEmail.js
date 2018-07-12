import { check } from "meteor/check";
import * as Collections from "/lib/collections";

/**
 * @method cart/setAnonymousUserEmail
 * @memberof Cart/Methods
 * @summary Assigns email to anonymous user's cart instance
 * @param {Object} userId - current user's Id
 * @param {String} email - email to set for anonymous user's cart instance
 * @return {Number} returns update result
 */
export default function setAnonymousUserEmail(userId, email) {
  check(userId, String);
  check(email, String);

  const currentUserCart = Collections.Cart.findOne({ userId });
  const cartId = currentUserCart._id;
  let newEmail = "";

  if (!currentUserCart.email) {
    newEmail = email;
  }

  return Collections.Cart.update({ _id: cartId }, { $set: { email: newEmail } });
}
