import Logger from "@reactioncommerce/logger";
import { Meteor } from "meteor/meteor";
import { Cart } from "/lib/collections";
import appEvents from "/imports/plugins/core/core/server/appEvents";

appEvents.on("afterCartUpdate", (cartId, cart) => {
  if (!cartId) {
    throw new Error("afterCartUpdate hook run with no cartId argument");
  }

  if (typeof cartId !== "string") {
    throw new Error("afterCartUpdate hook run with non-string cartId argument");
  }

  if (!cart) {
    throw new Error("afterCartUpdate hook run with no cart argument");
  }

  // refresh shipping quotes
  try {
    Meteor.call("shipping/updateShipmentQuotes", cartId);
  } catch (error) {
    Logger.error(`Error calling shipping/updateShipmentQuotes method in afterCartUpdate for cart with ID ${cartId}`, error);
  }

  // revert workflow to checkout shipping step.
  try {
    Meteor.call("workflow/revertCartWorkflow", "coreCheckoutShipping", cartId);
  } catch (error) {
    Logger.error("Error calling workflow/revertCartWorkflow method in afterCartUpdate", error);
  }

  // reset selected shipment method
  if (cart.shipping && cart.shipping[0] && cart.shipping[0].shipmentMethod) {
    Cart.update({ _id: cartId }, {
      $unset: { "shipping.0.shipmentMethod": "" }
    });

    const updatedCart = Cart.findOne({ _id: cartId });
    Promise.await(appEvents.emit("afterCartUpdate", cartId, updatedCart));
  }
});
