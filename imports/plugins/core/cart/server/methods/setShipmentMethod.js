import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Roles } from "meteor/alanning:roles";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import ReactionError from "@reactioncommerce/reaction-error";
import getCart from "/imports/plugins/core/cart/server/util/getCart";
import getGraphQLContextInMeteorMethod from "/imports/plugins/core/graphql/server/getGraphQLContextInMeteorMethod";
import selectFulfillmentOptionForGroup from "/imports/node-app/services/fulfillment/core/mutations/selectFulfillmentOptionForGroup";

/**
 * @method cart/setShipmentMethod
 * @memberof Cart/Methods
 * @summary Saves method as order default
 * @param {String} cartId - cartId to apply shipment method
 * @param {String} [cartToken] - Token for cart, if it's anonymous
 * @param {String} methodId - The selected method ID
 * @return {undefined}
 */
export default function setShipmentMethod(cartId, cartToken, methodId) {
  check(cartId, String);
  check(cartToken, Match.Maybe(String));
  check(methodId, String);

  const { cart } = getCart(cartId, { cartToken, throwIfNotFound: true });

  // For old Meteor code, we'll assume there's exactly one fulfillment group
  // of type "shipping".
  const group = (cart.shipping || []).find((grp) => grp.type === "shipping");
  if (!group) {
    throw new ReactionError("not-found", "Cart has no fulfillment group with type 'shipping'");
  }

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
  const result = Promise.await(selectFulfillmentOptionForGroup(context, {
    cartId,
    cartToken,
    fulfillmentGroupId: group._id,
    fulfillmentMethodId: methodId
  }));

  // this will transition to review
  Meteor.call("workflow/pushCartWorkflow", "coreCartWorkflow", "coreCheckoutShipping", cartId);

  return result;
}
