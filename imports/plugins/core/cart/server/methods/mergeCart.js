import Hooks from "@reactioncommerce/hooks";
import Logger from "@reactioncommerce/logger";
import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Accounts, Cart } from "/lib/collections";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import getCart from "/imports/plugins/core/cart/both/util/getCart";
import hashLoginToken from "/imports/plugins/core/accounts/server/no-meteor/util/hashLoginToken";

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
  const { account, cart: accountCart } = getCart(cartId);
  if (!accountCart) {
    throw new Meteor.Error("access-denied", "Access Denied");
  }

  // persistent sessions, see: publications/sessions.js
  // this is the last place where we still need `Reaction.sessionId`.
  // The use case is: on user log in. I don't know how pass `sessionId` down
  // at that moment.
  const sessionId = currentSessionId || Reaction.sessionId;
  const shopId = Reaction.getCartShopId();

  // If things are working properly, there should be only one.
  const sessionCarts = Cart.find({
    accountId: { $ne: accountCart._id },
    anonymousAccessToken: hashLoginToken(sessionId),
    shopId
  }).fetch();

  Logger.debug(`merge cart: begin merge processing of session carts into account cart with ID ${accountCart._id}`);
  // loop through session carts and merge into user cart
  sessionCarts.forEach((sessionCart) => {
    Logger.debug(`merge cart: merge user account ID: ${account._id}, sessionCart ID: ${sessionCart._id}`);

    // really if we have no items, there's nothing to merge
    if (Array.isArray(sessionCart.items) && sessionCart.items.length) {
      // if currentCart already have a cartWorkflow, we don't need to clean it
      // up completely, just to `coreCheckoutShipping` stage. Also, we will
      // need to recalculate shipping rates
      if (accountCart.workflow && accountCart.workflow.workflow) {
        if (accountCart.workflow.workflow.length > 2) {
          Meteor.call("workflow/revertCartWorkflow", "coreCheckoutShipping");
          // refresh shipping quotes
          Meteor.call("shipping/updateShipmentQuotes", cartId);
        }
      } else {
        // if user logged in he doesn't need to show `checkoutLogin` step
        Meteor.call("workflow/revertCartWorkflow", "checkoutAddressBook");
      }

      const cartSum = sessionCart.items.concat(accountCart.items);
      const mergedItems = cartSum.reduce((newItems, item) => {
        if (item) {
          const existingItem = newItems.find((cartItem) => cartItem.variantId === item.variantId);
          if (existingItem) {
            existingItem.quantity += item.quantity;
          } else {
            newItems.push(item);
          }
        }
        return newItems;
      }, []);

      Cart.update(accountCart._id, {
        $push: {
          items: { $each: mergedItems, $slice: -(mergedItems.length) }
        }
      });

      // Calculate discounts
      Hooks.Events.run("afterCartUpdateCalculateDiscount", accountCart._id);
    }

    // Destroy the anonymous cart
    Cart.remove({ _id: sessionCart._id });

    // Destroy the anonymous user and account
    const sessionAccount = Accounts.findOne({ _id: sessionCart.accountId });
    if (sessionAccount) {
      Accounts.remove({ _id: sessionAccount._id });
      Hooks.Events.run("afterAccountsRemove", this.userId, sessionAccount._id);
      Meteor.users.remove({ _id: sessionAccount.userId });
      Logger.debug(`merge cart: delete cart ${sessionCart._id} and anonymous account: ${sessionAccount._id}`);
    }

    Logger.debug(`merge cart: processed merge for anonymous cart ID ${sessionCart._id}`);
  });

  // `checkoutLogin` should be used for anonymous only. Registered users
  // no need see this.
  if (accountCart.workflow && accountCart.workflow.status === "new") {
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

  return accountCart._id;
}
