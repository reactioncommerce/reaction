import Hooks from "@reactioncommerce/hooks";
import Logger from "@reactioncommerce/logger";
import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import * as Collections from "/lib/collections";
import Reaction from "/server/api/core";

/**
 * @method cart/setPaymentAddress
 * @memberof Cart/Methods
 * @summary Adds address book to cart payments
 * @param {String} cartId - cartId to apply payment address
 * @param {Object} address - addressBook object
 * @todo maybe we need to rename this method to `cart/setBillingAddress`?
 * @return {Number} return Mongo update result
 */
export default function setPaymentAddress(cartId, address) {
  check(cartId, String);
  Reaction.Schemas.Address.validate(address);

  const cart = Collections.Cart.findOne({
    _id: cartId,
    userId: this.userId
  });

  if (!cart) {
    Logger.error(`Cart not found for user: ${this.userId}`);
    throw new Meteor.Error(
      "not-found",
      "Cart not found for user with such id"
    );
  }

  let selector;
  let update;
  // temp hack until we build out multiple billing handlers
  // if we have an existing item update it, otherwise add to set.
  if (Array.isArray(cart.billing) && cart.billing.length > 0) {
    selector = {
      "_id": cartId,
      "billing._id": cart.billing[0]._id
    };
    update = {
      $set: {
        "billing.$.address": address
      }
    };
  } else {
    selector = {
      _id: cartId
    };
    update = {
      $addToSet: {
        billing: {
          address
        }
      }
    };
  }

  const result = Collections.Cart.update(selector, update);

  // Calculate discounts
  Hooks.Events.run("afterCartUpdateCalculateDiscount", cartId);

  // Calculate taxes
  Hooks.Events.run("afterCartUpdateCalculateTaxes", cartId);

  return result;
}
