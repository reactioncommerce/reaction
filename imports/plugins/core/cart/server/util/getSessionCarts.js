import { Roles } from "meteor/alanning:roles";
import { Cart } from "/lib/collections";

/**
 * @method getSessionCarts
 * @private
 * @summary Get Cart cursor with all session carts
 * @param {String} userId - current user _id
 * @param {String} sessionId - current user session id
 * @param {String} shopId - shop id
 * @since 0.10.2
 * @return {Mongo.Cursor} with array of session carts
 */
export default function getSessionCarts(userId, sessionId, shopId) {
  const carts = Cart.find({
    $and: [{
      userId: {
        $ne: userId
      }
    }, {
      sessionId: {
        $eq: sessionId
      }
    }, {
      shopId: {
        $eq: shopId
      }
    }]
  });

  // we can't use Array.map here, because we need to reduce the number of array
  // elements if element belongs to registered user, we should throw it.
  const allowedCarts = [];

  // only anonymous user carts allowed
  carts.forEach((cart) => {
    if (Roles.userIsInRole(cart.userId, "anonymous", shopId)) {
      allowedCarts.push(cart);
    }
  });

  return allowedCarts;
}
