import { Meteor } from "meteor/meteor";
import { Cart } from "/lib/collections";
import { Hooks } from "/server/api";

Hooks.Events.add("afterCartUpdateCalculateDiscount", (cartId) => {
  if (cartId) {
    const cart = Cart.findOne({ _id: cartId });
    const discount = Meteor.call("discounts/calculate", cart);

    Cart.update({ _id: cart._id }, { $set: { discount } });

    // Calculate taxes
    Hooks.Events.run("afterCartUpdateCalculateTaxes", cartId);
  }
});
