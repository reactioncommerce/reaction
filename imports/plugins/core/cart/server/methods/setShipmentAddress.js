import Hooks from "@reactioncommerce/hooks";
import Logger from "@reactioncommerce/logger";
import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import * as Collections from "/lib/collections";
import Reaction from "/server/api/core";

/**
 * @method cart/setShipmentAddress
 * @memberof Cart/Methods
 * @summary Adds address book to cart shipping
 * @param {String} cartId - cartId to apply shipmentMethod
 * @param {Object} address - addressBook object
 * @return {Number} update result
 */
export default function setShipmentAddress(cartId, address) {
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
  // TODO: When we have a front end for doing more than one address
  // TODO: we need to not use the same address for every record
  // TODO: this is a temporary workaround so that we have a valid address
  // TODO: for every shipping record
  let selector;
  let update;
  let updated = false; // if we update inline set to true, otherwise fault to update at the end
  // We have two behaviors depending on if we have existing shipping records and if we
  // have items in the cart.
  if (cart.shipping && cart.shipping.length > 0 && cart.items) {
    // if we have shipping records and cart.items, update each one by shop
    const shopIds = Object.keys(cart.getItemsByShop());
    shopIds.forEach((shopId) => {
      selector = {
        "_id": cartId,
        "shipping.shopId": shopId
      };

      update = {
        $set: {
          "shipping.$.address": address
        }
      };
      try {
        Collections.Cart.update(selector, update);
        updated = true;
      } catch (error) {
        Logger.error(error, "An error occurred adding the address");
        throw new Meteor.Error(error, "An error occurred adding the address");
      }
    });
  } else if (!cart.items) { // if no items in cart just add or modify one record for the carts shop
    // add a shipping record if it doesn't exist
    if (!cart.shipping) {
      selector = {
        _id: cartId
      };
      update = {
        $push: {
          shipping: {
            address,
            shopId: cart.shopId
          }
        }
      };

      try {
        Collections.Cart.update(selector, update);
        updated = true;
      } catch (error) {
        Logger.error(error);
        throw new Meteor.Error("server-error", "An error occurred adding the address");
      }
    } else {
      // modify an existing record if we have one already
      selector = {
        "_id": cartId,
        "shipping.shopId": cart.shopId
      };

      update = {
        $set: {
          "shipping.$.address": address
        }
      };
    }
  } else {
    // if we have items in the cart but we didn't have existing shipping records
    // add a record for each shop that's represented in the items
    const shopIds = Object.keys(cart.getItemsByShop());
    shopIds.forEach((shopId) => {
      selector = {
        _id: cartId
      };
      update = {
        $addToSet: {
          shipping: {
            address,
            shopId
          }
        }
      };
    });
  }
  if (!updated) {
    // if we didn't do one of the inline updates, then run the update here
    try {
      Collections.Cart.update(selector, update);
    } catch (error) {
      Logger.error(error);
      throw new Meteor.Error("server-error", "An error occurred adding the address");
    }
  }
  // refresh shipping quotes
  Meteor.call("shipping/updateShipmentQuotes", cartId);

  // Calculate discounts
  Hooks.Events.run("afterCartUpdateCalculateDiscount", cartId);

  // Calculate taxes
  Hooks.Events.run("afterCartUpdateCalculateTaxes", cartId);

  if (typeof cart.workflow !== "object") {
    throw new Meteor.Error(
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
      "coreCheckoutShipping"
    );
  }

  // if we change default address during further steps, we need to revert
  // workflow back to `coreCheckoutShipping` step
  if (typeof cart.workflow.workflow === "object" &&
    cart.workflow.workflow.length > 2) { // "2" index of
    // `coreCheckoutShipping`
    Meteor.call("workflow/revertCartWorkflow", "coreCheckoutShipping");
  }

  return true;
}
