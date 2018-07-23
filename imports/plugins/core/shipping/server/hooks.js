import Hooks from "@reactioncommerce/hooks";
import Logger from "@reactioncommerce/logger";
import { Meteor } from "meteor/meteor";

Hooks.Events.add("afterCartUpdate", (cartId) => {
  // refresh shipping quotes
  try {
    Meteor.call("shipping/updateShipmentQuotes", cartId);
  } catch (error) {
    Logger.error(`Error calling shipping/updateShipmentQuotes method in afterCartUpdate for cart with ID ${cartId}`, error);
  }

  // revert workflow to checkout shipping step.
  try {
    Meteor.call("workflow/revertCartWorkflow", "coreCheckoutShipping");
  } catch (error) {
    Logger.error("Error calling workflow/revertCartWorkflow method in afterCartUpdate", error);
  }

  // reset selected shipment method
  try {
    Meteor.call("cart/resetShipmentMethod", cartId);
  } catch (error) {
    Logger.error(`Error calling cart/resetShipmentMethod method in afterCartUpdate for cart with ID ${cartId}`, error);
  }
});
