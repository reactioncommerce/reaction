import Hooks from "@reactioncommerce/hooks";
import Logger from "@reactioncommerce/logger";
import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Cart } from "/lib/collections";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import getCart from "/imports/plugins/core/cart/both/util/getCart";
import hashLoginToken from "/imports/plugins/core/accounts/server/no-meteor/util/hashLoginToken";
import getGraphQLContextInMeteorMethod from "/imports/plugins/core/graphql/server/getGraphQLContextInMeteorMethod";
import reconcileCarts from "../no-meteor/mutations/reconcileCarts";

/**
 * @method cart/mergeCart
 * @summary Merge matching sessionId cart into specified userId cart
 * There should be one cart for each independent, non-logged-in user session.
 * When a user logs in that cart now belongs to that user and we use the a single user cart.
 * If they are logged in on more than one devices, regardless of session,the user cart will be used
 * If they had more than one cart, on more than one device,logged in at separate times then merge the carts
 * @memberof Cart/Methods
 * @param {String} cartId - cartId of the cart to merge matching session carts into.
 * @param {String} sessionId - The session ID for the anonymous cart to pull items from
 * @return {Object|Boolean} cartId - cartId on success or false
 */
export default function mergeCart(cartId, sessionId) {
  check(cartId, String);
  check(sessionId, String);

  // we don't process current cart, but merge into it.
  const { account, cart: accountCart } = getCart(cartId);
  if (!accountCart || !account) {
    if (!accountCart) {
      Logger.error(`mergeCart: [Access Denied] Cart with ID ${cartId} was not found`);
    }
    const userId = Meteor.userId();
    if (!userId) {
      Logger.error("mergeCart: [Access Denied] No user ID");
    } else if (!account) {
      Logger.error(`mergeCart: [Access Denied] No account found with userId ${userId}`);
    }

    throw new Meteor.Error("access-denied", "Access Denied");
  }

  const shopId = Reaction.getCartShopId();

  // If things are working properly, there should be only one.
  const sessionCart = Cart.findOne({
    accountId: { $ne: accountCart._id },
    anonymousAccessToken: hashLoginToken(sessionId),
    shopId
  });

  if (!sessionCart) {
    throw new Meteor.Error("not-found", `No cart found with token ${sessionId}`);
  }

  // Pass through to the new mutation function at this point
  const context = Promise.await(getGraphQLContextInMeteorMethod(account.userId));
  Promise.await(reconcileCarts(context, {
    anonymousCartId: sessionCart._id,
    anonymousCartToken: sessionId,
    mode: "merge",
    shopId
  }));

  // Calculate discounts
  Hooks.Events.run("afterCartUpdateCalculateDiscount", accountCart._id);

  const accountCartWorkflow = accountCart.workflow;
  if (accountCartWorkflow && accountCartWorkflow.workflow) {
    if (accountCartWorkflow.workflow.length > 2) {
      Meteor.call("workflow/revertCartWorkflow", "coreCheckoutShipping");
      // refresh shipping quotes
      Meteor.call("shipping/updateShipmentQuotes", cartId);
    }
  } else if (accountCartWorkflow && accountCartWorkflow.status === "new") {
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
  } else {
    // if user logged in he doesn't need to show `checkoutLogin` step
    Meteor.call("workflow/revertCartWorkflow", "checkoutAddressBook");
  }

  return accountCart._id;
}
