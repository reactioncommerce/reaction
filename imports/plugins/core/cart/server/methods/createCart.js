import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Roles } from "meteor/alanning:roles";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import ReactionError from "@reactioncommerce/reaction-error";
import getGraphQLContextInMeteorMethod from "/imports/plugins/core/graphql/server/getGraphQLContextInMeteorMethod";
import createCart from "../no-meteor/mutations/createCart";

/**
 * @method cart/createCart
 * @summary create new cart for user
 * @memberof Cart/Methods
 * @param {Object[]} items - An array of cart items to add to the new cart. Must not be empty.
 * @returns {Object} The object returned by createCart mutation
 */
export default function createCartMethod(items) {
  check(items, [Object]);

  const shopId = Reaction.getCartShopId();
  if (!shopId) {
    throw new ReactionError("invalid-param", "No shop ID found");
  }

  // In Meteor app we always have a user, but it may have "anonymous" role, meaning
  // it was auto-created as a kind of session. If so, we fool the createCart mutation
  // into thinking there is no user so that it will create an anonymous cart.
  const userId = Meteor.userId();
  const anonymousUser = Roles.userIsInRole(userId, "anonymous", shopId);
  const userIdForContext = anonymousUser ? null : userId;

  const context = Promise.await(getGraphQLContextInMeteorMethod(userIdForContext));
  const result = Promise.await(createCart(context, { items, shopId }));

  const { cart } = result;

  // If we created an account cart, push workflow to address book step
  if (cart && userIdForContext) {
    Meteor.call(
      "workflow/pushCartWorkflow", "coreCartWorkflow",
      "checkoutLogin", cart._id
    );
    Meteor.call(
      "workflow/pushCartWorkflow", "coreCartWorkflow",
      "checkoutAddressBook", cart._id
    );
  }

  return result;
}
