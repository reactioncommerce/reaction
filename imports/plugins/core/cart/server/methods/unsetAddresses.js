import Logger from "@reactioncommerce/logger";
import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import ReactionError from "@reactioncommerce/reaction-error";
import { Cart } from "/lib/collections";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import getCart from "/imports/plugins/core/cart/server/util/getCart";
import appEvents from "/imports/node-app/core/util/appEvents";

/**
 * @method removeShippingAddresses
 * @private
 * @summary Remove shipping address from cart
 * @param {String} cart - current cart
 * @return {undefined}
 */
function removeShippingAddresses(cart) {
  const cartShipping = cart.shipping;
  cartShipping.map((sRecord) => delete sRecord.address);
  Cart.update({
    _id: cart._id
  }, {
    $set: { shipping: cartShipping }
  });
}

/**
 * @method cart/unsetAddresses
 * @summary Removes address from cart.
 * @memberof Cart/Methods
 * @param {String} cartId - Cart ID
 * @param {String} [cartToken] - Cart token, if anonymous
 * @param {String} addressId - address._id
 * @param {String} [type] - billing default or shipping default
 * @since 0.10.1
 * @todo Check if no more address in cart as shipping, we should reset `cartWorkflow` to second step
 * @return {Number|Object|Boolean} The number of removed documents or
 * error object or `false` if we don't need to update cart
 */
export default function unsetAddresses(cartId, cartToken, addressId, type) {
  check(cartId, String);
  check(cartToken, Match.Maybe(String));
  check(addressId, String);
  check(type, Match.Optional(String));

  // do we actually need to change anything?
  let needToUpdate = false;
  // we need to revert the workflow after a "shipping" address was removed
  let isShippingDeleting = false;

  const { cart } = getCart(cartId, { cartToken, throwIfNotFound: true });

  const update = { $unset: {} };
  // user could turn off the checkbox in address to not to be default, then we
  // receive `type` arg
  if (typeof type === "string") {
    // we assume that the billing/shipping arrays can hold only one element [0]
    if (cart[type] && typeof cart[type][0].address === "object" &&
      cart[type][0].address._id === addressId) {
      update.$unset[`${type}.0.address`] = "";
      needToUpdate = true;
      isShippingDeleting = type === "shipping";
    }
  } else { // or if we remove address itself, when we run this part we assume
    // that the billing/shipping arrays can hold only one element [0]
    if (cart.billing && typeof cart.billing[0].address === "object" &&
      cart.billing[0].address._id === addressId) {
      update.$unset["billing.0.address"] = "";
      needToUpdate = true;
    }
    if (cart.shipping && typeof cart.shipping[0].address === "object" && cart.shipping[0].address._id === addressId) {
      removeShippingAddresses(cart);
      isShippingDeleting = true;
    }
  }

  if (needToUpdate) {
    try {
      Cart.update({ _id: cartId }, update);
    } catch (error) {
      Logger.error(error);
      throw new ReactionError("server-error", "Error updating cart");
    }
  }

  if (needToUpdate || isShippingDeleting) {
    if (isShippingDeleting) {
      // if we remove shipping address from cart, we need to revert
      // `cartWorkflow` to the `checkoutAddressBook` step.
      Meteor.call("workflow/revertCartWorkflow", "checkoutAddressBook", cartId);
    }

    const updatedCart = Cart.findOne({ _id: cartId });
    Promise.await(appEvents.emit("afterCartUpdate", {
      cart: updatedCart,
      updatedBy: Reaction.getUserId()
    }));
  }

  return true;
}
