import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import getGraphQLContextInMeteorMethod from "/imports/plugins/core/graphql/server/getGraphQLContextInMeteorMethod";
import reconcileCarts from "../no-meteor/mutations/reconcileCarts";

/**
 * @method cart/mergeCart
 * @summary Merge anonymous cart into specified account cart
 * There should be one cart for each independent, non-logged-in user session.
 * When a user logs in that cart now belongs to that user and we use the a single user cart.
 * If they are logged in on more than one devices, regardless of session,the user cart will be used
 * If they had more than one cart, on more than one device,logged in at separate times then merge the carts
 * @memberof Cart/Methods
 * @param {String} anonymousCartId - Cart ID of the cart to merge FROM and then delete
 * @param {String} anonymousCartToken - Token granting access to the anonymous cart
 * @return {Object|Boolean} cartId - cartId on success or false
 */
export default function mergeCart(anonymousCartId, anonymousCartToken) {
  check(anonymousCartId, String);
  check(anonymousCartToken, String);

  // Pass through to the new mutation function at this point
  const context = Promise.await(getGraphQLContextInMeteorMethod(Meteor.userId()));
  const { cart } = Promise.await(reconcileCarts(context, {
    anonymousCartId,
    anonymousCartToken,
    mode: "merge"
  }));

  const cartId = cart._id;

  const accountCartWorkflow = cart.workflow;
  if (accountCartWorkflow && accountCartWorkflow.workflow) {
    if (accountCartWorkflow.workflow.length > 2) {
      Meteor.call("workflow/revertCartWorkflow", "coreCheckoutShipping", cart._id);
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
    Meteor.call("workflow/revertCartWorkflow", "checkoutAddressBook", cartId);
  }

  return cartId;
}
