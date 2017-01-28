import { indexOf } from "lodash";
import { Cart } from "/lib/collections";

/**
* Cart Hooks for Discounts
* @type {Object}
* @desc After cart update apply discounts.
* if items are changed, recalculating discounts
* we could have done this in the core/cart transform
* but this way this file controls the events from
* the core/discounts plugin.
* @todo just move so a single Hook.event and move all the
* cart hooks to a single location.
*/
Cart.after.update((userId, cart, fieldNames) => {
  const trigger = ["discount", "billing", "shipping"];
  let discount = 0;
  if (cart) {
    for (const field of fieldNames) {
      if (indexOf(trigger, field) !== -1) {
        discount = Meteor.call("discounts/calculate", cart);
      }
    }
    // Update cart (without triggering more updates.)
    Cart.direct.update({ _id: cart._id }, { $set: { discount: discount } });
  }
});
