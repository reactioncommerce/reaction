import Hooks from "@reactioncommerce/hooks";
import Logger from "@reactioncommerce/logger";
import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Roles } from "meteor/alanning:roles";
import * as Collections from "/lib/collections";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import getSessionCarts from "../util/getSessionCarts";

/**
 * @method cart/mergeCart
 * @summary Merge matching sessionId cart into specified userId cart
 * There should be one cart for each independent, non-logged-in user session.
 * When a user logs in that cart now belongs to that user and we use the a single user cart.
 * If they are logged in on more than one devices, regardless of session,the user cart will be used
 * If they had more than one cart, on more than one device,logged in at separate times then merge the carts
 * @memberof Cart/Methods
 * @param {String} cartId - cartId of the cart to merge matching session carts into.
 * @param {String} [currentSessionId] - current client session id
 * @todo I think this method should be moved out from methods to a Function Declaration to keep it more secure
 * @return {Object|Boolean} cartId - cartId on success or false
 */
export default function mergeCart(cartId, currentSessionId) {
  check(cartId, String);
  // TODO: Review this. currentSessionId sometimes come in as false. e.g from Accounts.onLogin
  check(currentSessionId, Match.Optional(String));

  // we don't process current cart, but merge into it.
  const currentCart = Collections.Cart.findOne(cartId);
  if (!currentCart) {
    throw new Meteor.Error("access-denied", "Access Denied");
  }
  // just used to filter out the current cart
  // we do additional check of cart exists here and if it not exist, next
  // check supposed to throw 403 error
  const userId = currentCart && currentCart.userId;
  // user should have an access to operate with only one - his - cart
  if (this.userId !== null && userId !== this.userId) {
    throw new Meteor.Error("access-denied", "Access Denied");
  }
  // persistent sessions, see: publications/sessions.js
  // this is the last place where we still need `Reaction.sessionId`.
  // The use case is: on user log in. I don't know how pass `sessionId` down
  // at that moment.
  const sessionId = currentSessionId || Reaction.sessionId;
  const shopId = Reaction.getShopId();

  // no need to merge anonymous carts
  if (Roles.userIsInRole(userId, "anonymous", shopId)) {
    return false;
  }
  Logger.debug("merge cart: matching sessionId");
  Logger.debug("current userId:", userId);
  Logger.debug("sessionId:", sessionId);
  // get session carts without current user cart cursor
  const sessionCarts = getSessionCarts(userId, sessionId, shopId);

  Logger.debug(`merge cart: begin merge processing of session ${
    sessionId} into: ${currentCart._id}`);
  // loop through session carts and merge into user cart
  sessionCarts.forEach((sessionCart) => {
    Logger.debug(`merge cart: merge user userId: ${userId}, sessionCart.userId: ${
      sessionCart.userId}, sessionCart id: ${sessionCart._id}`);
    // really if we have no items, there's nothing to merge
    if (sessionCart.items) {
      // if currentCart already have a cartWorkflow, we don't need to clean it
      // up completely, just to `coreCheckoutShipping` stage. Also, we will
      // need to recalculate shipping rates
      if (typeof currentCart.workflow === "object" &&
      typeof currentCart.workflow.workflow === "object") {
        if (currentCart.workflow.workflow.length > 2) {
          Meteor.call("workflow/revertCartWorkflow", "coreCheckoutShipping");
          // refresh shipping quotes
          Meteor.call("shipping/updateShipmentQuotes", cartId);
        }
      } else {
        // if user logged in he doesn't need to show `checkoutLogin` step
        Meteor.call("workflow/revertCartWorkflow", "checkoutAddressBook");
      }

      const cartSum = sessionCart.items.concat(currentCart.items);
      const mergedItems = cartSum.reduce((newItems, item) => {
        if (item) {
          const existingItem = newItems.find((cartItem) => cartItem.variants._id === item.variants._id);
          if (existingItem) {
            existingItem.quantity += item.quantity;
          } else {
            newItems.push(item);
          }
        }
        return newItems;
      }, []);
      Collections.Cart.update(currentCart._id, {
        $push: {
          items: { $each: mergedItems, $slice: -(mergedItems.length) }
        }
      });

      // Calculate discounts
      Hooks.Events.run("afterCartUpdateCalculateDiscount", currentCart._id);
    }

    // cleanup session Carts after merge.
    if (sessionCart.userId !== this.userId) {
      // clear the cart that was used for a session
      // and we're also going to do some garbage Collection
      Collections.Cart.remove(sessionCart._id);
      // cleanup user/accounts
      Collections.Accounts.remove({
        userId: sessionCart.userId
      });
      Hooks.Events.run("afterAccountsRemove", this.userId, sessionCart.userId);
      Meteor.users.remove(sessionCart.userId);
      Logger.debug(`merge cart: delete cart ${
        sessionCart._id} and user: ${sessionCart.userId}`);
    }
    Logger.debug(`merge cart: processed merge for cartId ${sessionCart._id}`);
  });

  // `checkoutLogin` should be used for anonymous only. Registered users
  // no need see this.
  if (currentCart.workflow && currentCart.workflow.status === "new") {
    // to call `workflow/pushCartWorkflow` two times is the only way to move
    // from status "new" to "checkoutAddressBook" which I found without
    // refactoring of `workflow/pushCartWorkflow`
    // We send `cartId` as arguments because this method could be called from
    // publication method and in half cases it could be so, that
    // Meteor.userId() will be null.
    Meteor.call(
      "workflow/pushCartWorkflow", "coreCartWorkflow",
      "checkoutLogin", cartId
    );
    Meteor.call(
      "workflow/pushCartWorkflow", "coreCartWorkflow",
      "checkoutAddressBook", cartId
    );
  }

  return currentCart._id;
}
