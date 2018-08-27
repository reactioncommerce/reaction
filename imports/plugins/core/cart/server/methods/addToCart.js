import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Roles } from "meteor/alanning:roles";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import getGraphQLContextInMeteorMethod from "/imports/plugins/core/graphql/server/getGraphQLContextInMeteorMethod";
import addCartItems from "../no-meteor/mutations/addCartItems";

/**
 *  @method cart/addToCart
 *  @summary Add items to a user cart. When we add an item to the cart,
 *  we want to break all relationships with the existing item.
 *  We want to fix price, qty, etc into history.
 *  However, we could check reactively for price /qty etc, adjustments on the original and notify them.
 *  @memberof Cart/Methods
 *  @param {String} cartId - The cart ID
 *  @param {String} [token] - The cart token, if it's an anonymous cart
 *  @param {Object[]} items - An array of cart items to add to the new cart. Must not be empty.
 *  @return {Object} An object with the updated cart document (`cart`), `incorrectPriceFailures`, and
 *    `minOrderQuantityFailures`
 */
export default function addToCart(cartId, token, items) {
  check(cartId, String);
  check(token, Match.Maybe(String));
  check(items, [Object]);

  const shopId = Reaction.getCartShopId();
  if (!shopId) {
    throw new Meteor.Error("invalid-param", "No shop ID found");
  }

  // In Meteor app we always have a user, but it may have "anonymous" role, meaning
  // it was auto-created as a kind of session. If so, we fool the createCart mutation
  // into thinking there is no user so that it will create an anonymous cart.
  const userId = Reaction.getUserId();
  const anonymousUser = Roles.userIsInRole(userId, "anonymous", shopId);
  const userIdForContext = anonymousUser ? null : userId;

  const context = Promise.await(getGraphQLContextInMeteorMethod(userIdForContext));
  const {
    cart: updatedCart,
    incorrectPriceFailures,
    minOrderQuantityFailures
  } = Promise.await(addCartItems(context, {
    cartId,
    items,
    token
  }));

  // Never send the hashed token to a client
  delete updatedCart.anonymousAccessToken;

  return {
    cart: updatedCart,
    incorrectPriceFailures,
    minOrderQuantityFailures
  };
}
