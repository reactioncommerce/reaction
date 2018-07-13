import Hooks from "@reactioncommerce/hooks";
import Logger from "@reactioncommerce/logger";
import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import * as Collections from "/lib/collections";

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
  Collections.Cart.update({
    _id: cart._id
  }, {
    $set: { shipping: cartShipping }
  });

  // Calculate discounts
  Hooks.Events.run("afterCartUpdateCalculateDiscount", cart._id);

  // Calculate taxes
  Hooks.Events.run("afterCartUpdateCalculateTaxes", cart._id);
}

/**
 * @method cart/unsetAddresses
 * @summary Removes address from cart.
 * @memberof Cart/Methods
 * @param {String} addressId - address._id
 * @param {String} userId - cart owner _id
 * @param {String} [type] - billing default or shipping default
 * @since 0.10.1
 * @todo Check if no more address in cart as shipping, we should reset `cartWorkflow` to second step
 * @return {Number|Object|Boolean} The number of removed documents or
 * error object or `false` if we don't need to update cart
 */
export default function unsetAddresses(addressId, userId, type) {
  check(addressId, String);
  check(userId, String);
  check(type, Match.Optional(String));

  // do we actually need to change anything?
  let needToUpdate = false;
  // we need to revert the workflow after a "shipping" address was removed
  let isShippingDeleting = false;
  const cart = Collections.Cart.findOne({
    userId
  });
  const selector = {
    _id: cart._id
  };
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
      Collections.Cart.update(selector, update);
    } catch (e) {
      Logger.error(e);
      throw new Meteor.Error("server-error", "Error updating cart");
    }

    // Calculate discounts
    Hooks.Events.run("afterCartUpdateCalculateDiscount", cart._id);

    if (isShippingDeleting) {
      // if we remove shipping address from cart, we need to revert
      // `cartWorkflow` to the `checkoutAddressBook` step.
      Meteor.call("workflow/revertCartWorkflow", "checkoutAddressBook");
    }
  }
  return true;
}
