import { indexOf } from "lodash";
import { Meteor } from "meteor/meteor";
import { Cart } from "/lib/collections";

/**
 * Cart Hooks for Taxes
*/

/**
 * After cart update apply taxes.
 * if items are changed, recalculating taxes
 * we could have done this in the core/cart transform
 * but this way this file controls the events from
 * the core/taxes plugin.
 */
Cart.after.update((userId, cart, fieldNames) => {
  const trigger = ["discount", "billing", "shipping"];

  let recalculateTax = false;
  for (const field of fieldNames) {
    if (indexOf(trigger, field) !== -1) {
      recalculateTax = true;
    }
  }
  if (recalculateTax) {
    console.log("God has decided to recalculate tax ##########", fieldNames);
    Meteor.call("taxes/calculate", cart._id);
  }
});
