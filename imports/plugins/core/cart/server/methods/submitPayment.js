import Hooks from "@reactioncommerce/hooks";
import Logger from "@reactioncommerce/logger";
import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import * as Collections from "/lib/collections";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import getCart from "/imports/plugins/core/cart/server/util/getCart";
import { PaymentMethodArgument } from "/lib/collections/schemas";

/**
 * @method cart/submitPayment
 * @memberof Cart/Methods
 * @summary Saves a submitted payment to cart, triggers workflow and adds "paymentSubmitted" to cart workflow
 * Note: this method also has a client stub, that forwards to cartCompleted
 * @param {String} cartId - The cart ID
 * @param {String} [cartToken] - The cart token, if it's anonymous
 * @param {Object|Array} paymentMethods - an array of paymentMethods or (deprecated) a single paymentMethod object
 * @return {String} returns update result
 */
export default function submitPayment(cartId, cartToken, paymentMethods) {
  check(cartId, String);
  check(cartToken, Match.Maybe(String));
  PaymentMethodArgument.validate(paymentMethods);

  const { cart } = getCart(cartId, { cartToken, throwIfNotFound: true });

  const cartShipping = cart.getShippingTotal();
  const cartShippingByShop = cart.getShippingTotalByShop();
  const cartSubTotal = cart.getSubTotal();
  const cartSubtotalByShop = cart.getSubtotalByShop();
  const cartTaxes = cart.getTaxTotal();
  const cartTaxesByShop = cart.getTaxesByShop();
  const cartDiscounts = cart.getDiscounts();
  const cartTotal = cart.getTotal();
  const cartTotalByShop = cart.getTotalByShop();

  // we won't actually close the order at this stage.
  // we'll just update the workflow and billing data where
  // method-hooks can process the workflow update.

  // Find the payment address associated that the user input during the
  // checkout process
  let paymentAddress;
  if (Array.isArray(cart.billing) && cart.billing[0]) {
    paymentAddress = cart.billing[0].address;
  }

  const payments = [];

  // Payment plugins which have been updated for marketplace are passing an array as paymentMethods
  if (Array.isArray(paymentMethods)) {
    paymentMethods.forEach((paymentMethod) => {
      const { shopId } = paymentMethod;
      const invoice = {
        shipping: parseFloat(cartShippingByShop[shopId]),
        subtotal: parseFloat(cartSubtotalByShop[shopId]),
        taxes: parseFloat(cartTaxesByShop[shopId]),
        discounts: parseFloat(cartDiscounts),
        total: parseFloat(cartTotalByShop[shopId])
      };

      payments.push({
        paymentMethod,
        invoice,
        address: paymentAddress,
        shopId
      });
    });
  } else {
    // Legacy payment integration - transactions are not split by shop
    // Create an invoice based on cart totals.
    const invoice = {
      shipping: cartShipping,
      subtotal: cartSubTotal,
      taxes: cartTaxes,
      discounts: cartDiscounts,
      total: cartTotal
    };

    // Legacy payment plugins are passing in a single paymentMethod object
    payments.push({
      paymentMethod: paymentMethods,
      invoice,
      address: paymentAddress,
      shopId: Reaction.getPrimaryShopId()
    });
  }

  // e.g. discount records would be already present on the billing array. Add to the end of the array.
  const discountRecords = cart.billing.filter((billingInfo) => billingInfo.paymentMethod);
  payments.push(...discountRecords);

  const selector = {
    _id: cartId
  };

  const update = {
    $set: {
      billing: payments
    }
  };

  try {
    Collections.Cart.update(selector, update);
  } catch (error) {
    Logger.error(error);
    throw new Meteor.Error("server-error", "An error occurred saving the order");
  }

  // Calculate discounts
  Hooks.Events.run("afterCartUpdateCalculateDiscount", cartId);

  const updatedCart = Collections.Cart.findOne(selector);

  // update workflow
  Meteor.call("workflow/pushCartWorkflow", "coreCartWorkflow", "paymentSubmitted", cartId);

  // create order
  if (updatedCart && updatedCart.items && updatedCart.billing && updatedCart.billing[0].paymentMethod) {
    Meteor.call("cart/copyCartToOrder", cart._id, cartToken);
  } else {
    throw new Meteor.Error(
      "server-error",
      "An error occurred verifying payment method. Failed to save order."
    );
  }

  // The cart has now been deleted by copyCartToOrder, but we'll return the one we have
  return updatedCart;
}
