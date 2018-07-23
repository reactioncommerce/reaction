import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Roles } from "meteor/alanning:roles";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import getGraphQLContextInMeteorMethod from "/imports/plugins/core/graphql/server/getGraphQLContextInMeteorMethod";
import createCart from "../no-meteor/mutations/createCart";

/**
 * @method cart/createCart
 * @summary create new cart for user
 * @memberof Cart/Methods
 * @param {String} sessionId - current client session ID (backwards compatibility with old Meteor client code)
 *   If provided, used as the `anonymousAccessToken` for non-account carts
 * @returns {String} The ID of the created cart
 */
export default function createCartMethod(sessionId) {
  check(sessionId, Match.Maybe(String));

  const shopId = Reaction.getCartShopId();
  if (!shopId) {
    throw new Meteor.Error("invalid-param", "No shop ID found");
  }

  // check if user has `anonymous` role.( this is a visitor)
  const userId = Meteor.userId();
  const anonymousUser = Roles.userIsInRole(userId, "anonymous", shopId);

  if (anonymousUser && !sessionId) {
    throw new Meteor.Error("invalid-param", "sessionId is required for anonymous cart creation");
  }

  const context = Promise.await(getGraphQLContextInMeteorMethod(userId));
  const { cart } = Promise.await(createCart(context, {
    anonymousAccessTokenFromClient: anonymousUser ? sessionId : null,
    items: [],
    shopId,
    shouldCreateWithoutItems: true
  }));

  // Merge all anonymous carts into the new account cart
  if (!anonymousUser && sessionId) {
    Meteor.call("cart/mergeCart", cart._id, sessionId);
  }

  return cart._id;
}
