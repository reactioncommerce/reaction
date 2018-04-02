import { Meteor } from "meteor/meteor";
import { Cart } from "/lib/collections";
import { Hooks } from "/server/api";

/**
* Cart Hooks for Discounts
* @type {Object}
* @desc After cart update apply discounts.
* if items are changed, recalculating discounts
* we could have done this in the core/cart transform
* but this way this file controls the events from
* the core/discounts plugin.
*/
Hooks.Events.add("afterCartUpdateCalculateDiscount", (cartId) => {
  if (cartId) {
    const cart = Cart.findOne({ _id: cartId });
    const discount = Meteor.call("discounts/calculate", cart);

    Cart.update({ _id: cart._id }, { $set: { discount } });

    // Calculate taxes
    Hooks.Events.run("afterCartUpdateCalculateTaxes", cartId);
  }
});
