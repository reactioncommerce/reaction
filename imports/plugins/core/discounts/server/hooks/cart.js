import Hooks from "@reactioncommerce/hooks";
import { Meteor } from "meteor/meteor";
import appEvents from "/imports/plugins/core/core/server/appEvents";
import { Cart } from "/lib/collections";

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

  const discount = Meteor.call("discounts/calculate", cart);
  if (discount !== cart.discount) {
    Cart.update({ _id: cart._id }, { $set: { discount } });
  }

  // Calculate taxes
  Hooks.Events.run("afterCartUpdateCalculateTaxes", cartId);
});
