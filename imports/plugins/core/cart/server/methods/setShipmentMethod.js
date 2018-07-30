import Hooks from "@reactioncommerce/hooks";
import Logger from "@reactioncommerce/logger";
import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import * as Collections from "/lib/collections";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import ReactionError from "/imports/plugins/core/graphql/server/no-meteor/ReactionError";
import getCart from "/imports/plugins/core/cart/both/util/getCart";

/**
 * @method cart/setShipmentMethod
 * @memberof Cart/Methods
 * @summary Saves method as order default
 * @param {String} cartId - cartId to apply shipmentMethod
 * @param {Object} method - shipmentMethod object
 * @return {Number} return Mongo update result
 */
export default function setShipmentMethod(cartId, method) {
  check(cartId, String);
  Reaction.Schemas.ShippingMethod.validate(method);

  const { cart } = getCart(cartId, { throwIfNotFound: true });

  // Sets all shipping methods to the one selected
  // TODO: Accept an object of shopId to method map to ship via different methods per shop
  let update;
  // if we have an existing item update it, otherwise add to set.
  if (cart.shipping) {
    const shipping = cart.shipping.map((shipRecord) => ({
      ...shipRecord,
      shipmentMethod: method
    }));
    update = { $set: { shipping } };
  } else {
    update = {
      $addToSet: {
        shipping: {
          shipmentMethod: method,
          shopId: cart.shopId
        }
      }
    };
  }

  // update or insert method
  try {
    Collections.Cart.update({ _id: cartId }, update);
  } catch (error) {
    Logger.error(error, `Error adding rates to cart ${cartId}`);
    throw new ReactionError("server-error", "An error occurred saving the order", error);
  }


  // Calculate discounts
  Hooks.Events.run("afterCartUpdateCalculateDiscount", cart._id);

  // this will transition to review
  return Meteor.call("workflow/pushCartWorkflow", "coreCartWorkflow", "coreCheckoutShipping");
}
