import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Roles } from "meteor/alanning:roles";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import { Address as AddressSchema } from "/imports/collections/schemas";
import ReactionError from "@reactioncommerce/reaction-error";
import getGraphQLContextInMeteorMethod from "/imports/plugins/core/graphql/server/getGraphQLContextInMeteorMethod";
import setShippingAddressOnCart from "../no-meteor/mutations/setShippingAddressOnCart";
import updateFulfillmentOptionsForGroup from "/imports/node-app/services/fulfillment/core/mutations/updateFulfillmentOptionsForGroup";

/**
 * @method cart/setShipmentAddress
 * @memberof Cart/Methods
 * @summary Adds address book to cart shipping
 * @param {String} cartId - The ID of the cart on which to set shipping address
 * @param {String} [cartToken] - Token for cart, if it's anonymous
 * @param {Object} address - addressBook object
 * @return {Number} update result
 */
export default function setShipmentAddress(cartId, cartToken, address) {
  check(cartId, String);
  check(cartToken, Match.Maybe(String));
  AddressSchema.validate(address);

  const shopId = Reaction.getCartShopId();
  if (!shopId) {
    throw new ReactionError("invalid-param", "No shop ID found");
  }

  // In Meteor app we always have a user, but it may have "anonymous" role, meaning
  // it was auto-created as a kind of session.
  const userId = Reaction.getUserId();
  const anonymousUser = Roles.userIsInRole(userId, "anonymous", shopId);
  const userIdForContext = anonymousUser ? null : userId;

  const context = Promise.await(getGraphQLContextInMeteorMethod(userIdForContext));
  const result = Promise.await(setShippingAddressOnCart(context, {
    address,
    cartId,
    cartToken
  }));

  let { cart } = result;

  // We now ask clients to call this when necessary to avoid calling it when not needed, but the Meteor
  // client still relies on it being called here, and on the workflow updates below this.
  if (cart.shipping && cart.shipping.length) {
    ({ cart } = Promise.await(updateFulfillmentOptionsForGroup(context, {
      cartId,
      cartToken,
      fulfillmentGroupId: cart.shipping[0]._id
    })));
  }

  if (typeof cart.workflow !== "object") {
    throw new ReactionError(
      "server-error",
      "Cart workflow object not detected."
    );
  }

  // ~~it's ok for this to be called multiple times~~
  // call it only once when we at the `checkoutAddressBook` step
  if (typeof cart.workflow.workflow === "object" &&
    cart.workflow.workflow.length < 2) {
    Meteor.call(
      "workflow/pushCartWorkflow", "coreCartWorkflow",
      "coreCheckoutShipping", cartId
    );
  }

  // if we change default address during further steps, we need to revert
  // workflow back to `coreCheckoutShipping` step
  if (typeof cart.workflow.workflow === "object" &&
    cart.workflow.workflow.length > 2) { // "2" index of
    // `coreCheckoutShipping`
    Meteor.call("workflow/revertCartWorkflow", "coreCheckoutShipping", cartId);
  }

  return result;
}
