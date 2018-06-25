import Logger from "@reactioncommerce/logger";
import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Roles } from "meteor/alanning:roles";
import * as Collections from "/lib/collections";
import Reaction from "/server/api/core";
import getSessionCarts from "../util/getSessionCarts";

/**
 * @method cart/createCart
 * @summary create new cart for user,
 * but all checks for current cart's existence should go before this method will be called, to keep it clean
 * @memberof Cart/Methods
 * @param {String} userId - userId to create cart for
 * @param {String} sessionId - current client session id
 * @todo I think this method should be moved out from methods to a Function Declaration to keep it more secure
 * @returns {String} cartId - users cartId
 */
export default function createCart(userId, sessionId) {
  check(userId, String);
  check(sessionId, String);

  const marketplaceSettings = Reaction.getMarketplaceSettings();
  let shopId;
  if (marketplaceSettings && marketplaceSettings.public && marketplaceSettings.public.merchantCart) {
    shopId = Reaction.getShopId();
  } else {
    shopId = Reaction.getPrimaryShopId();
  }

  // check if user has `anonymous` role.( this is a visitor)
  const anonymousUser = Roles.userIsInRole(userId, "anonymous", shopId);
  const sessionCartCount = getSessionCarts(userId, sessionId, shopId).length;

  Logger.debug("create cart: shopId", shopId);
  Logger.debug("create cart: userId", userId);
  Logger.debug("create cart: sessionId", sessionId);
  Logger.debug("create cart: sessionCarts.count", sessionCartCount);
  Logger.debug("create cart: anonymousUser", anonymousUser);

  // we need to create a user cart for the new authenticated user or
  // anonymous.
  const currentCartId = Collections.Cart.insert({
    sessionId,
    shopId,
    userId
  });
  Logger.debug(`create cart: into new user cart. created: ${currentCartId} for user ${userId}`);

  // merge session carts into the current cart
  if (sessionCartCount > 0 && !anonymousUser) {
    Logger.debug(`create cart: found existing cart. merge into ${currentCartId} for user ${userId}`);
    Meteor.call("cart/mergeCart", currentCartId, sessionId);
  }

  // we should check for an default billing/shipping address in user account.
  // this needed after submitting order, when user receives new cart
  const account = Collections.Accounts.findOne(userId);
  if (account && account.profile && account.profile.addressBook) {
    account.profile.addressBook.forEach((address) => {
      if (address.isBillingDefault) {
        Meteor.call("cart/setPaymentAddress", currentCartId, address);
      }
      if (address.isShippingDefault) {
        Meteor.call("cart/setShipmentAddress", currentCartId, address);
      }
    });
  }

  // attach current user currency to cart
  const currentUser = Meteor.user();
  let userCurrency = Reaction.getShopCurrency();

  // Check to see if the user has a custom currency saved to their profile
  // Use it if they do
  if (currentUser && currentUser.profile && currentUser.profile.currency) {
    userCurrency = currentUser.profile.currency;
  }
  Meteor.call("cart/setUserCurrency", currentCartId, userCurrency);

  return currentCartId;
}
